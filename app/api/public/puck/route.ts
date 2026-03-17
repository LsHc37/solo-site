import { NextResponse } from "next/server";
import db from "@/lib/db";

const PUCK_HOME_DATA_KEY = "puck_home_data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const row = db
      .prepare("SELECT value FROM site_settings WHERE key = ?")
      .get(PUCK_HOME_DATA_KEY) as { value: string } | undefined;

    if (!row?.value) {
      return NextResponse.json({ data: { root: { props: { title: "" } }, content: [] } });
    }

    const data = JSON.parse(row.value);
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: { root: { props: { title: "" } }, content: [] } });
  }
}
