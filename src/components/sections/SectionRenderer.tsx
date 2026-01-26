import { HeroSection } from "./HeroSection";
import { RichTextSection } from "./RichTextSection";
import { GallerySection } from "./GallerySection";
import { SnippetSection } from "./SnippetSection";
import { CtaSection } from "./CtaSection";
import { ListingsSection } from "./ListingsSection";
import { SocialFeedSection } from "./SocialFeedSection";
import { LeadFormSection } from "./LeadFormSection";

type Section = {
  _type?: string;
  _key?: string;
  [key: string]: any;
};

export function SectionRenderer({ sections }: { sections?: Section[] | null }) {
  if (!sections?.length) {
    console.warn('[SectionRenderer] No sections provided');
    return null;
  }

  console.debug(`[SectionRenderer] Rendering ${sections.length} section(s)`);

  return (
    <>
      {sections.map((section, index) => {
        const key =
          section?._key ||
          (section?._type ? `${section._type}-${index}` : `section-${index}`);

        console.debug(`[SectionRenderer] Section ${index}: type="${section?._type}", key="${key}"`);

        switch (section?._type) {
          case "sectionHero":
            console.debug('[SectionRenderer] → Rendering HeroSection');
            return <HeroSection key={key} {...section} />;

          case "sectionRichText":
            console.debug('[SectionRenderer] → Rendering RichTextSection');
            return <RichTextSection key={key} {...section} />;

          case "sectionGallery":
            console.debug('[SectionRenderer] → Rendering GallerySection');
            return <GallerySection key={key} {...section} />;

          case "sectionSnippet":
            console.debug('[SectionRenderer] → Rendering SnippetSection');
            return <SnippetSection key={key} {...section} />;

          case "sectionCta":
            console.debug('[SectionRenderer] → Rendering CtaSection');
            return <CtaSection key={key} {...section} />;

          case "sectionListings":
            console.debug('[SectionRenderer] → Rendering ListingsSection');
            return <ListingsSection key={key} {...section} />;

          case "sectionSocialFeed":
            console.debug('[SectionRenderer] → Rendering SocialFeedSection');
            return <SocialFeedSection key={key} {...section} />;

          case "sectionLeadForm":
            console.debug('[SectionRenderer] → Rendering LeadFormSection');
            return <LeadFormSection key={key} {...section} />;

          default:
            console.warn(`[SectionRenderer] Unknown section type: "${section?._type}"`);
            return null;
        }
      })}
    </>
  );
}

