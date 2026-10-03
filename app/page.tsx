import { Hero } from "@/components/home/Hero";
import { ScrubVideo } from "@/components/home/ScrubVideo";
import { OrchestrationSection } from "@/components/home/OrchestrationSection";
import { HorizontalWorkforce } from "@/components/home/HorizontalWorkforce";
import { StackingWorkflow } from "@/components/home/StackingWorkflow";
import { DelegationFlow } from "@/components/home/DelegationFlow";
import { VisionSection } from "@/components/home/VisionSection";
import { IronFilings } from "@/components/home/IronFilings";
import { FieldFilms } from "@/components/home/FieldFilms";
import { SelfHealing } from "@/components/home/SelfHealing";
import { HumanInLoop } from "@/components/home/HumanInLoop";
import { ToolEcosystem } from "@/components/home/ToolEcosystem";
import { ScatteredType } from "@/components/home/ScatteredType";
import { ZoomThrough } from "@/components/home/ZoomThrough";
import { FinalCTA, OutcomeMarquee } from "@/components/home/FinalCTA";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { AgentsSection } from "@/components/home/AgentsSection";
import { OrchestrationDetail } from "@/components/home/OrchestrationDetail";
import { UseCasesSection } from "@/components/home/UseCasesSection";
import { PricingSection } from "@/components/home/PricingSection";
import { WritingSection } from "@/components/home/WritingSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ContactSection } from "@/components/home/ContactSection";

/**
 * One page. Everything that used to be a separate route — features, agents,
 * orchestration, tools, use cases, writing, about and contact — is now a
 * chapter of this document, and the nav scrolls between them.
 *
 * Section order follows the narrative, not the nav: perception → reasoning →
 * the workforce and its mechanics → the field and the tools it reaches →
 * capabilities → the roster that staffs them → orchestration → use cases →
 * writing → philosophy → contact.
 */
export default function Home() {
  return (
    <main>
      <Hero />
      <ScrubVideo />
      <OrchestrationSection />
      <HorizontalWorkforce />
      <StackingWorkflow />
      <DelegationFlow />
      <SelfHealing />
      <HumanInLoop />
      <ToolEcosystem />
      <VisionSection />
      <IronFilings />
      <FieldFilms />
      <ScatteredType />
      <ZoomThrough />
      <OutcomeMarquee />

      {/* Capabilities, roster, coordination, practice, writing, philosophy. */}
      <FeaturesSection />
      <AgentsSection />
      <OrchestrationDetail />
      <UseCasesSection />
      <PricingSection />
      <WritingSection />
      <AboutSection />
      <ContactSection />

      <FinalCTA />
    </main>
  );
}