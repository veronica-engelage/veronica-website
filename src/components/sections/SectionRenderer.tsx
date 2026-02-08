import { HeroSection } from "@/components/sections/HeroSection";
import { RichTextSection } from "@/components/sections/RichTextSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { ListingsSection } from "@/components/sections/ListingsSection";
import { SocialFeedSection } from "@/components/sections/SocialFeedSection";
import { LeadFormSection } from "@/components/sections/LeadFormSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { SnippetSection } from "@/components/sections/SnippetSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CommunityCarouselSection } from "@/components/sections/CommunityCarouselSection";
import { IdxWidgetSection } from "@/components/sections/IdxWidgetSection";


type SectionRendererProps = {
  sections: any[];
  phone?: string | null; // pass SiteSettings phone here
};

export function SectionRenderer({ sections, phone }: SectionRendererProps) {
  if (!Array.isArray(sections)) {
    console.warn("[SectionRenderer] sections is not an array", sections);
    return null;
  }

  console.log(`[SectionRenderer] Rendering ${sections.length} section(s)`);

  return (
    <>
      {sections.map((section, i) => {
        console.log(
          `[SectionRenderer] Section ${i}: type="${section?._type}", key="${section?._key}"`
        );

        switch (section?._type) {
          case "sectionHero":
            console.log("[SectionRenderer] → Rendering HeroSection");
            return <HeroSection key={section._key} {...section} phone={phone} />;

          case "sectionRichText":
            console.log("[SectionRenderer] → Rendering RichTextSection");
            return <RichTextSection key={section._key} {...section} />;

          case "sectionGallery": {
            console.log("[SectionRenderer] → Rendering GallerySection");
            console.log("[SectionRenderer] gallery debug", {
              title: section?.title,
              layout: section?.layout,
              itemsLength: section?.items?.length,
              firstItem: section?.items?.[0],
            });
            return <GallerySection key={section._key} {...section} />;
          }

          case "sectionListings":
            console.log("[SectionRenderer] → Rendering ListingsSection");
            return <ListingsSection key={section._key} {...section} />;

          case "sectionSocialFeed":
            console.log("[SectionRenderer] → Rendering SocialFeedSection");
            return <SocialFeedSection key={section._key} {...section} />;

          case "sectionLeadForm":
            console.log("[SectionRenderer] → Rendering LeadFormSection");
            return <LeadFormSection key={section._key} {...section} />;

          case "sectionCta":
            console.log("[SectionRenderer] → Rendering CtaSection");
            return <CtaSection key={section._key} {...section} />;

          case "sectionSnippet":
            console.log("[SectionRenderer] → Rendering SnippetSection");
            return <SnippetSection key={section._key} {...section} />;

          case "sectionCommunityCarousel":
            console.log("[SectionRenderer] → Rendering CommunityCarouselSection");
            return <CommunityCarouselSection key={section._key} {...section} />;

          case "sectionTestimonials":
            console.log("[SectionRenderer] → Rendering TestimonialsSection");
            return <TestimonialsSection key={section._key} {...section} />;

          case "sectionIdxWidget":
            console.log("[SectionRenderer] → Rendering IdxWidgetSection");
            return <IdxWidgetSection key={section._key} {...section} />;

          default:
            console.warn(
              `[SectionRenderer] Unknown section type "${section?._type}"`,
              section
            );
            return null;
        }
      })}
    </>
  );
}
