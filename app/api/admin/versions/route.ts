import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { VersionControl, DraftManager, SessionManager, initializeVersionControl } from "@/lib/version-control";

// Initialize tables on first import
initializeVersionControl();

export async function GET(req: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const id = searchParams.get("id");

  try {
    switch (action) {
      case "list":
        const versions = VersionControl.getVersions();
        return NextResponse.json({ versions });

      case "get":
        if (!id) {
          return NextResponse.json({ error: "Version ID required" }, { status: 400 });
        }
        const version = VersionControl.getVersion(parseInt(id));
        if (!version) {
          return NextResponse.json({ error: "Version not found" }, { status: 404 });
        }
        return NextResponse.json({ version });

      case "published":
        const published = VersionControl.getPublishedVersion();
        return NextResponse.json({ version: published });

      case "draft":
        const draft = DraftManager.getDraft();
        return NextResponse.json({ draft });

      case "session":
        const currentSession = SessionManager.getCurrentSession();
        const isExpired = currentSession ? SessionManager.isLockExpired(currentSession) : true;
        
        return NextResponse.json({
          session: currentSession,
          isExpired,
          canEdit: !currentSession || isExpired || currentSession.user_id === session?.user?.email,
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Version API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await req.json() as {
    action: string;
    id?: number;
    label?: string;
    content?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };

  const userId = session?.user?.email || "unknown";
  const userName = session?.user?.name || "Admin";

  try {
    switch (body.action) {
      case "create":
        if (!body.label || !body.content) {
          return NextResponse.json({ error: "Label and content required" }, { status: 400 });
        }

        const versionId = VersionControl.createVersion(
          body.label,
          body.content,
          userId,
          false,
          body.metadata
        );

        return NextResponse.json({ success: true, versionId });

      case "publish":
        if (!body.id) {
          return NextResponse.json({ error: "Version ID required" }, { status: 400 });
        }

        const publishSuccess = VersionControl.publishVersion(body.id);
        if (publishSuccess) {
          DraftManager.clearDraft();
        }

        return NextResponse.json({ success: publishSuccess });

      case "delete":
        if (!body.id) {
          return NextResponse.json({ error: "Version ID required" }, { status: 400 });
        }

        const deleteSuccess = VersionControl.deleteVersion(body.id);
        return NextResponse.json({ success: deleteSuccess });

      case "save-draft":
        if (!body.content) {
          return NextResponse.json({ error: "Content required" }, { status: 400 });
        }

        DraftManager.saveDraft(body.content, userId);
        return NextResponse.json({ success: true });

      case "clear-draft":
        DraftManager.clearDraft();
        return NextResponse.json({ success: true });

      case "acquire-session":
        const acquired = SessionManager.acquireLock(userId, userName);
        return NextResponse.json({ success: acquired });

      case "ping-session":
        SessionManager.acquireLock(userId, userName);
        return NextResponse.json({ success: true });

      case "release-session":
        SessionManager.releaseLock(userId);
        return NextResponse.json({ success: true });

      case "prune":
        VersionControl.pruneOldVersions(body.metadata?.keepCount as number || 100);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Version API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Version ID required" }, { status: 400 });
  }

  try {
    const success = VersionControl.deleteVersion(parseInt(id));
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
