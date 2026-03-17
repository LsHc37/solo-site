import { DropZone, type Config } from "@measured/puck";
import { useState } from "react";

type HeroProps = {
  title: string;
  description: string;
  bgColor: string;
  alignment: string;
};

type TextBlockProps = {
  text: string;
  bgColor: string;
  alignment: string;
};

type PricingCardProps = {
  planName: string;
  price: string;
  features: string;
};

type ColumnsProps = {
  gap: "small" | "medium" | "large";
};

type ImageItem = {
  url: string;
  alt: string;
};

type ImageGalleryProps = {
  images: ImageItem[];
  columns: "2" | "3" | "4";
};

type PuckComponents = {
  Hero: HeroProps;
  TextBlock: TextBlockProps;
  PricingCard: PricingCardProps;
  Columns: ColumnsProps;
  ImageGallery: ImageGalleryProps;
};

function ImageGalleryRender({ images, columns }: ImageGalleryProps) {
  const [lightbox, setLightbox] = useState<ImageItem | null>(null);

  const colClass = { "2": "grid-cols-2", "3": "grid-cols-2 sm:grid-cols-3", "4": "grid-cols-2 sm:grid-cols-4" }[columns];

  return (
    <>
      <div className={`grid ${colClass} gap-3`}>
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightbox(img)}
            className="overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt}
              className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url}
              alt={lightbox.alt}
              className="max-h-[85vh] w-auto rounded-xl object-contain shadow-2xl"
            />
            {lightbox.alt && (
              <p className="mt-2 text-center text-sm text-slate-300">{lightbox.alt}</p>
            )}
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label="Close lightbox"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const config: Config<PuckComponents> = {
  categories: {
    Layout: {
      components: ["Columns"],
    },
    Marketing: {
      components: ["Hero", "PricingCard"],
    },
    Typography: {
      components: ["TextBlock"],
    },
    Media: {
      components: ["ImageGallery"],
    },
  },
  components: {
    Hero: {
      fields: {
        title: {
          type: "text",
          label: "Title",
        },
        description: {
          type: "textarea",
          label: "Description",
        },
        bgColor: {
          type: "select",
          label: "Background Color",
          options: [
            { label: "Dark – Slate 900", value: "bg-slate-900" },
            { label: "Dark – Slate 800", value: "bg-slate-800" },
            { label: "Light – White", value: "bg-white" },
            { label: "Light – Slate 50", value: "bg-slate-50" },
            { label: "Brand – Cyan 500", value: "bg-cyan-500" },
            { label: "Brand – Violet 600", value: "bg-violet-600" },
            { label: "Accent – Rose 500", value: "bg-rose-500" },
            { label: "Transparent", value: "bg-transparent" },
          ],
        },
        alignment: {
          type: "select",
          label: "Alignment",
          options: [
            { label: "Left", value: "text-left" },
            { label: "Center", value: "text-center" },
            { label: "Right", value: "text-right" },
          ],
        },
      },
      defaultProps: {
        title: "Build your next retro event",
        description:
          "Create and publish pages quickly with a visual editor powered by Puck.",
        bgColor: "bg-slate-900",
        alignment: "text-center",
      },
      render: ({ title, description, bgColor, alignment }) => {
        return (
          <section className={`rounded-2xl px-6 py-16 text-white shadow-xl md:px-10 ${bgColor}`}>
            <div className={`mx-auto max-w-3xl ${alignment}`}>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>
              <p className="mt-4 text-base leading-7 text-slate-200 md:text-lg">
                {description}
              </p>
            </div>
          </section>
        );
      },
    },
    TextBlock: {
      label: "Text Block",
      fields: {
        text: {
          type: "textarea",
          label: "Text",
        },
        bgColor: {
          type: "select",
          label: "Background Color",
          options: [
            { label: "Dark – Slate 900", value: "bg-slate-900" },
            { label: "Dark – Slate 800", value: "bg-slate-800" },
            { label: "Light – White", value: "bg-white" },
            { label: "Light – Slate 50", value: "bg-slate-50" },
            { label: "Brand – Cyan 500", value: "bg-cyan-500" },
            { label: "Brand – Violet 600", value: "bg-violet-600" },
            { label: "Accent – Rose 500", value: "bg-rose-500" },
            { label: "Transparent", value: "bg-transparent" },
          ],
        },
        alignment: {
          type: "select",
          label: "Alignment",
          options: [
            { label: "Left", value: "text-left" },
            { label: "Center", value: "text-center" },
            { label: "Right", value: "text-right" },
          ],
        },
      },
      defaultProps: {
        text: "This is a simple text block. Edit this content in the Puck sidebar.",
        bgColor: "bg-white",
        alignment: "text-left",
      },
      render: ({ text, bgColor, alignment }) => {
        return (
          <section className={`rounded-xl border border-slate-200 p-6 shadow-sm ${bgColor}`}>
            <p className={`text-base leading-7 text-slate-700 ${alignment}`}>{text}</p>
          </section>
        );
      },
    },
    PricingCard: {
      label: "Pricing Card",
      fields: {
        planName: {
          type: "text",
          label: "Plan Name",
        },
        price: {
          type: "text",
          label: "Price",
        },
        features: {
          type: "textarea",
          label: "Features (one per line)",
        },
      },
      defaultProps: {
        planName: "Pro",
        price: "$29/mo",
        features: "Unlimited projects\nPriority support\nAdvanced analytics",
      },
      render: ({ planName, price, features }) => {
        const featureItems = features
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

        return (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-900">{planName}</h3>
              <p className="text-2xl font-extrabold text-cyan-600">{price}</p>
            </div>

            <ul className="mt-5 space-y-2">
              {featureItems.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-cyan-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      },
    },
    Columns: {
      label: "Columns",
      fields: {
        gap: {
          type: "select",
          label: "Gap between columns",
          options: [
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ],
        },
      },
      defaultProps: {
        gap: "medium",
      },
      render: ({ gap }) => {
        const gapClass = {
          small: "gap-2",
          medium: "gap-6",
          large: "gap-12",
        }[gap];
        return (
          <div className={`grid grid-cols-2 ${gapClass}`}>
            <DropZone zone="column-left" />
            <DropZone zone="column-right" />
          </div>
        );
      },
    },
    ImageGallery: {
      label: "Image Gallery",
      fields: {
        images: {
          type: "array",
          label: "Images",
          arrayFields: {
            url: { type: "text", label: "Image URL" },
            alt: { type: "text", label: "Alt Text" },
          },
          defaultItemProps: {
            url: "https://placehold.co/600x400/1e293b/94a3b8?text=Image",
            alt: "",
          },
        },
        columns: {
          type: "select",
          label: "Columns",
          options: [
            { label: "2", value: "2" },
            { label: "3", value: "3" },
            { label: "4", value: "4" },
          ],
        },
      },
      defaultProps: {
        columns: "3",
        images: [
          { url: "https://placehold.co/600x400/1e293b/94a3b8?text=Image+1", alt: "Image 1" },
          { url: "https://placehold.co/600x400/1e293b/94a3b8?text=Image+2", alt: "Image 2" },
          { url: "https://placehold.co/600x400/1e293b/94a3b8?text=Image+3", alt: "Image 3" },
        ],
      },
      render: ImageGalleryRender,
    },
  },
};

export default config;
