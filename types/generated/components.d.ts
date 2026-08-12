import type { Schema, Struct } from '@strapi/strapi';

export interface AboutBenefitItem extends Struct.ComponentSchema {
  collectionName: 'components_about_benefit_items';
  info: {
    displayName: 'Benefit Item';
    icon: 'check';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface AboutBenefits extends Struct.ComponentSchema {
  collectionName: 'components_about_benefitses';
  info: {
    displayName: 'Benefits';
    icon: 'check';
  };
  attributes: {
    heading: Schema.Attribute.String;
    intro: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'about.benefit-item', true>;
    sideImage: Schema.Attribute.Media<'images'>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface AboutBrandCulture extends Struct.ComponentSchema {
  collectionName: 'components_about_brand_cultures';
  info: {
    displayName: 'Brand Culture';
    icon: 'discuss';
  };
  attributes: {
    heading: Schema.Attribute.String;
    tabs: Schema.Attribute.Component<'about.brand-culture-tab', true>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface AboutBrandCultureTab extends Struct.ComponentSchema {
  collectionName: 'components_about_brand_culture_tabs';
  info: {
    displayName: 'Brand Culture Tab';
    icon: 'layer';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String;
    tagline: Schema.Attribute.String;
  };
}

export interface AboutCaseStudies extends Struct.ComponentSchema {
  collectionName: 'components_about_case_studieses';
  info: {
    displayName: 'About Case Studies';
    icon: 'file';
  };
  attributes: {
    ctaButton: Schema.Attribute.Component<'shared.button', false>;
    featuredCaseStudies: Schema.Attribute.Relation<
      'oneToMany',
      'api::case-study.case-study'
    >;
    tag: Schema.Attribute.Component<'shared.tag', false>;
    title: Schema.Attribute.String;
  };
}

export interface AboutFounderQuote extends Struct.ComponentSchema {
  collectionName: 'components_about_founder_quotes';
  info: {
    displayName: 'Founder Quote';
    icon: 'quote';
  };
  attributes: {
    name: Schema.Attribute.String;
    photo: Schema.Attribute.Media<'images'>;
    quote: Schema.Attribute.Text;
    tag: Schema.Attribute.Component<'shared.tag', false>;
    title: Schema.Attribute.String;
  };
}

export interface AboutLocationItem extends Struct.ComponentSchema {
  collectionName: 'components_about_location_items';
  info: {
    displayName: 'Location Item';
    icon: 'pinMap';
  };
  attributes: {
    countryName: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'>;
  };
}

export interface AboutLocations extends Struct.ComponentSchema {
  collectionName: 'components_about_locationses';
  info: {
    displayName: 'Locations';
    icon: 'earth';
  };
  attributes: {
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'about.location-item', true>;
  };
}

export interface AboutLogoItem extends Struct.ComponentSchema {
  collectionName: 'components_about_logo_items';
  info: {
    displayName: 'Logo Item';
    icon: 'picture';
  };
  attributes: {
    logo: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String;
  };
}

export interface AboutLogoMarquee extends Struct.ComponentSchema {
  collectionName: 'components_about_logo_marquees';
  info: {
    displayName: 'Logo Marquee';
    icon: 'slideshow';
  };
  attributes: {
    logos: Schema.Attribute.Component<'about.logo-item', true>;
  };
}

export interface AboutTeam extends Struct.ComponentSchema {
  collectionName: 'components_about_teams';
  info: {
    displayName: 'Team';
    icon: 'user';
  };
  attributes: {
    heading: Schema.Attribute.String;
    intro: Schema.Attribute.Text;
    members: Schema.Attribute.Relation<
      'oneToMany',
      'api::team-member.team-member'
    >;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface AboutTimeline extends Struct.ComponentSchema {
  collectionName: 'components_about_timelines';
  info: {
    displayName: 'Timeline';
    icon: 'clock';
  };
  attributes: {
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'about.timeline-item', true>;
    shipImage: Schema.Attribute.Media<'images'>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface AboutTimelineItem extends Struct.ComponentSchema {
  collectionName: 'components_about_timeline_items';
  info: {
    displayName: 'Timeline Item';
    icon: 'clock';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
    year: Schema.Attribute.String;
  };
}

export interface AboutVisionMissionValues extends Struct.ComponentSchema {
  collectionName: 'components_about_vision_mission_valueses';
  info: {
    displayName: 'Vision Mission Values';
    icon: 'crown';
  };
  attributes: {
    heading: Schema.Attribute.String;
    missionIcon: Schema.Attribute.Media<'images'>;
    missionText: Schema.Attribute.Text;
    missionTitle: Schema.Attribute.String;
    tag: Schema.Attribute.Component<'shared.tag', false>;
    valuesIcon: Schema.Attribute.Media<'images'>;
    valuesText: Schema.Attribute.Text;
    valuesTitle: Schema.Attribute.String;
    visionIcon: Schema.Attribute.Media<'images'>;
    visionText: Schema.Attribute.Text;
    visionTitle: Schema.Attribute.String;
  };
}

export interface CaseStudiesList extends Struct.ComponentSchema {
  collectionName: 'components_case_studies_lists';
  info: {
    displayName: 'Case Studies List';
    icon: 'filter';
  };
  attributes: {
    heading: Schema.Attribute.String;
    pageSize: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<12>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface CaseStudyHighlight extends Struct.ComponentSchema {
  collectionName: 'components_case_study_highlights';
  info: {
    displayName: 'Case Study Highlight';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface ContactGetInTouch extends Struct.ComponentSchema {
  collectionName: 'components_contact_get_in_touches';
  info: {
    displayName: 'Get In Touch';
    icon: 'phone';
  };
  attributes: {
    description: Schema.Attribute.Text;
    form: Schema.Attribute.Component<'contact.hubspot-form', false>;
    heading: Schema.Attribute.String;
    infoItems: Schema.Attribute.Component<'contact.info-item', true>;
    socialLabel: Schema.Attribute.String;
    socialLinks: Schema.Attribute.Component<'elements.social-link', true>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface ContactHubspotForm extends Struct.ComponentSchema {
  collectionName: 'components_contact_hubspot_forms';
  info: {
    displayName: 'HubSpot Form';
    icon: 'code';
  };
  attributes: {
    formId: Schema.Attribute.String;
    portalId: Schema.Attribute.String;
    region: Schema.Attribute.String & Schema.Attribute.DefaultTo<'na1'>;
  };
}

export interface ContactInfoItem extends Struct.ComponentSchema {
  collectionName: 'components_contact_info_items';
  info: {
    displayName: 'Contact Info Item';
    icon: 'information';
  };
  attributes: {
    href: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String;
    value: Schema.Attribute.Text;
  };
}

export interface ElementsCertificationLogo extends Struct.ComponentSchema {
  collectionName: 'components_elements_certification_logos';
  info: {
    displayName: 'Certification Logo';
    icon: 'medium';
  };
  attributes: {
    logo: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String;
  };
}

export interface ElementsFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_faq_items';
  info: {
    displayName: 'FAQ Item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    question: Schema.Attribute.String;
  };
}

export interface ElementsFeatureCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_feature_cards';
  info: {
    displayName: 'Feature Card';
    icon: 'puzzle';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'>;
    image: Schema.Attribute.Media<'images'>;
    size: Schema.Attribute.Enumeration<['large', 'small']> &
      Schema.Attribute.DefaultTo<'small'>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_elements_footer_columns';
  info: {
    displayName: 'Footer Column';
    icon: 'layout';
  };
  attributes: {
    hasSeeMore: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    links: Schema.Attribute.Component<'elements.footer-link', true>;
    seeMoreUrl: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ElementsFooterCtaBanner extends Struct.ComponentSchema {
  collectionName: 'components_elements_footer_cta_banners';
  info: {
    displayName: 'Footer CTA Banner';
    icon: 'message';
  };
  attributes: {
    contactUrl: Schema.Attribute.String;
    hoverLabel: Schema.Attribute.String;
    marqueeText: Schema.Attribute.String;
  };
}

export interface ElementsFooterLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_footer_links';
  info: {
    displayName: 'Footer Link';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface ElementsFooterLocation extends Struct.ComponentSchema {
  collectionName: 'components_elements_footer_locations';
  info: {
    displayName: 'Footer Location';
    icon: 'pinMap';
  };
  attributes: {
    address: Schema.Attribute.Text;
    email: Schema.Attribute.String;
    name: Schema.Attribute.String;
  };
}

export interface ElementsFooterNewsletter extends Struct.ComponentSchema {
  collectionName: 'components_elements_footer_newsletters';
  info: {
    displayName: 'Footer Newsletter';
    icon: 'envelop';
  };
  attributes: {
    buttonLabel: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    placeholder: Schema.Attribute.String;
  };
}

export interface ElementsNavItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_nav_items';
  info: {
    displayName: 'Nav Item';
    icon: 'bulletList';
  };
  attributes: {
    children: Schema.Attribute.Component<'elements.nav-link', true>;
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface ElementsNavLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_nav_links';
  info: {
    displayName: 'Nav Link';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface ElementsRotatingWord extends Struct.ComponentSchema {
  collectionName: 'components_elements_rotating_words';
  info: {
    displayName: 'Rotating Word';
    icon: 'typhoon';
  };
  attributes: {
    text: Schema.Attribute.String;
  };
}

export interface ElementsServiceCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_service_cards';
  info: {
    displayName: 'Service Card';
    icon: 'grid';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'>;
    linkLabel: Schema.Attribute.String;
    linkUrl: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ElementsServiceTab extends Struct.ComponentSchema {
  collectionName: 'components_elements_service_tabs';
  info: {
    displayName: 'Service Tab';
    icon: 'layer';
  };
  attributes: {
    cards: Schema.Attribute.Component<'elements.service-card', true>;
    label: Schema.Attribute.String;
  };
}

export interface ElementsSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_social_links';
  info: {
    displayName: 'Social Link';
    icon: 'thumbUp';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface ElementsTitleSegment extends Struct.ComponentSchema {
  collectionName: 'components_elements_title_segments';
  info: {
    displayName: 'Title Segment';
    icon: 'brush';
  };
  attributes: {
    highlight: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    text: Schema.Attribute.String;
  };
}

export interface LayoutFooter extends Struct.ComponentSchema {
  collectionName: 'components_layout_footers';
  info: {
    displayName: 'Footer';
    icon: 'layout';
  };
  attributes: {
    copyright: Schema.Attribute.String;
    ctaBanner: Schema.Attribute.Component<'elements.footer-cta-banner', false>;
    legalLinks: Schema.Attribute.Component<'elements.footer-link', true>;
    linkColumns: Schema.Attribute.Component<'elements.footer-column', true>;
    locations: Schema.Attribute.Component<'elements.footer-location', true>;
    logo: Schema.Attribute.Media<'images'>;
    newsletter: Schema.Attribute.Component<'elements.footer-newsletter', false>;
    newsletterForm: Schema.Attribute.Component<'contact.hubspot-form', false>;
    socialMedia: Schema.Attribute.Component<'elements.social-link', true>;
  };
}

export interface LayoutNavbar extends Struct.ComponentSchema {
  collectionName: 'components_layout_navbars';
  info: {
    displayName: 'Navbar';
    icon: 'layout';
  };
  attributes: {
    ctaButton: Schema.Attribute.Component<'shared.button', false>;
    logo: Schema.Attribute.Media<'images'>;
    menuItems: Schema.Attribute.Component<'elements.nav-item', true>;
  };
}

export interface ProcessTimeline extends Struct.ComponentSchema {
  collectionName: 'components_process_timelines';
  info: {
    displayName: 'Process Timeline';
    icon: 'stack';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    steps: Schema.Attribute.Component<'process.timeline-step', true>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface ProcessTimelineStep extends Struct.ComponentSchema {
  collectionName: 'components_process_timeline_steps';
  info: {
    displayName: 'Timeline Step';
    icon: 'stack';
  };
  attributes: {
    description: Schema.Attribute.Text;
    label: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ProductSourceItem extends Struct.ComponentSchema {
  collectionName: 'components_product_source_items';
  info: {
    displayName: 'Source Item';
    icon: 'picture';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface ProductsCertifications extends Struct.ComponentSchema {
  collectionName: 'components_products_certificationses';
  info: {
    displayName: 'Certifications';
    icon: 'medium';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    logos: Schema.Attribute.Component<'elements.certification-logo', true>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface ProductsHero extends Struct.ComponentSchema {
  collectionName: 'components_products_heros';
  info: {
    displayName: 'Products Hero';
    icon: 'apps';
  };
  attributes: {
    ctaButton: Schema.Attribute.Component<'shared.button', false>;
    image: Schema.Attribute.Media<'images'>;
    rotatingWords: Schema.Attribute.Component<'elements.rotating-word', true>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
    titlePrefix: Schema.Attribute.String;
  };
}

export interface ProductsProductList extends Struct.ComponentSchema {
  collectionName: 'components_products_product_lists';
  info: {
    displayName: 'Product List';
    icon: 'grid';
  };
  attributes: {
    cardButtonLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface ResourcesDownloadCta extends Struct.ComponentSchema {
  collectionName: 'components_resources_download_ctas';
  info: {
    displayName: 'Download CTA';
    icon: 'download';
  };
  attributes: {
    buttonLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    file: Schema.Attribute.Media<'images' | 'files'>;
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface ResourcesFreeResources extends Struct.ComponentSchema {
  collectionName: 'components_resources_free_resourceses';
  info: {
    displayName: 'Free Resources';
    icon: 'download';
  };
  attributes: {
    heading: Schema.Attribute.String;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface ResourcesInsights extends Struct.ComponentSchema {
  collectionName: 'components_resources_insightses';
  info: {
    displayName: 'Insights';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    pageSize: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<12>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface ResourcesLeadCapture extends Struct.ComponentSchema {
  collectionName: 'components_resources_lead_captures';
  info: {
    displayName: 'Lead Capture';
    icon: 'envelop';
  };
  attributes: {
    buttonLabel: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    placeholder: Schema.Attribute.String;
    subheading: Schema.Attribute.Text;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface SectionsCaseStudies extends Struct.ComponentSchema {
  collectionName: 'components_sections_case_studieses';
  info: {
    displayName: 'Case Studies Section';
    icon: 'file';
  };
  attributes: {
    ctaButton: Schema.Attribute.Component<'shared.button', false>;
    featuredCaseStudies: Schema.Attribute.Relation<
      'oneToMany',
      'api::case-study.case-study'
    >;
    tag: Schema.Attribute.Component<'shared.tag', false>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsFaq extends Struct.ComponentSchema {
  collectionName: 'components_sections_faqs';
  info: {
    displayName: 'FAQ Section';
    icon: 'question';
  };
  attributes: {
    contactEmail: Schema.Attribute.String;
    contactText: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'elements.faq-item', true>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
    title: Schema.Attribute.String;
    titleHighlight: Schema.Attribute.String;
  };
}

export interface SectionsFeaturedResources extends Struct.ComponentSchema {
  collectionName: 'components_sections_featured_resourceses';
  info: {
    displayName: 'Featured Resources';
    icon: 'book';
  };
  attributes: {
    featuredResources: Schema.Attribute.Relation<
      'oneToMany',
      'api::resource.resource'
    >;
    tag: Schema.Attribute.Component<'shared.tag', false>;
    title: Schema.Attribute.String;
    titleHighlight: Schema.Attribute.String;
    viewAllButton: Schema.Attribute.Component<'shared.button', false>;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heros';
  info: {
    displayName: 'Hero';
    icon: 'apps';
  };
  attributes: {
    backgroundVideo: Schema.Attribute.Media<'images' | 'files'>;
    ctaButton: Schema.Attribute.Component<'shared.slide-button', false>;
    posterImage: Schema.Attribute.Media<'images'>;
    rotatingWords: Schema.Attribute.Component<'elements.rotating-word', true>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
    videoUrl: Schema.Attribute.String;
  };
}

export interface SectionsMissionVideo extends Struct.ComponentSchema {
  collectionName: 'components_sections_mission_videos';
  info: {
    displayName: 'Mission Video';
    icon: 'play';
  };
  attributes: {
    buttons: Schema.Attribute.Component<'shared.button', true>;
    certifications: Schema.Attribute.Component<
      'elements.certification-logo',
      true
    >;
    guideFile: Schema.Attribute.Media<'files' | 'images'>;
    subtitle: Schema.Attribute.Text;
    titleSegments: Schema.Attribute.Component<'elements.title-segment', true>;
  };
}

export interface SectionsPartners extends Struct.ComponentSchema {
  collectionName: 'components_sections_partnerses';
  info: {
    displayName: 'Partners';
    icon: 'handHeart';
  };
  attributes: {
    ctaButton: Schema.Attribute.Component<'shared.button', false>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
    title: Schema.Attribute.String;
    titleHighlight: Schema.Attribute.String;
  };
}

export interface SectionsSourcingServices extends Struct.ComponentSchema {
  collectionName: 'components_sections_sourcing_serviceses';
  info: {
    displayName: 'Sourcing Services';
    icon: 'briefcase';
  };
  attributes: {
    tabs: Schema.Attribute.Component<'elements.service-tab', true>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsTestimonialCarousel extends Struct.ComponentSchema {
  collectionName: 'components_sections_testimonial_carousels';
  info: {
    displayName: 'Testimonial Carousel';
    icon: 'quote';
  };
  attributes: {
    heading: Schema.Attribute.String;
    tag: Schema.Attribute.Component<'shared.tag', false>;
    testimonials: Schema.Attribute.Relation<
      'oneToMany',
      'api::testimonial.testimonial'
    >;
  };
}

export interface SectionsWhyChooseUs extends Struct.ComponentSchema {
  collectionName: 'components_sections_why_choose_uses';
  info: {
    displayName: 'Why Choose Us';
    icon: 'shield';
  };
  attributes: {
    ctaButton: Schema.Attribute.Component<'shared.button', false>;
    features: Schema.Attribute.Component<'elements.feature-card', true>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
    title: Schema.Attribute.String;
  };
}

export interface ServicesCategoryShowcase extends Struct.ComponentSchema {
  collectionName: 'components_services_category_showcases';
  info: {
    displayName: 'Category Showcase';
    icon: 'grid';
  };
  attributes: {
    button: Schema.Attribute.Component<'shared.button', false>;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    tabs: Schema.Attribute.Component<'services.category-tab', true>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface ServicesCategoryTab extends Struct.ComponentSchema {
  collectionName: 'components_services_category_tabs';
  info: {
    displayName: 'Category Tab';
    icon: 'layer';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
  };
}

export interface ServicesHero extends Struct.ComponentSchema {
  collectionName: 'components_services_heros';
  info: {
    displayName: 'Services Hero';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    rotatingWords: Schema.Attribute.Component<'elements.rotating-word', true>;
    title: Schema.Attribute.String;
  };
}

export interface ServicesOfferingItem extends Struct.ComponentSchema {
  collectionName: 'components_services_offering_items';
  info: {
    displayName: 'Offering Item';
    icon: 'cube';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface ServicesOfferings extends Struct.ComponentSchema {
  collectionName: 'components_services_offeringses';
  info: {
    displayName: 'Offerings';
    icon: 'cube';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'services.offering-item', true>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface ServicesProcess extends Struct.ComponentSchema {
  collectionName: 'components_services_processes';
  info: {
    displayName: 'Process';
    icon: 'stack';
  };
  attributes: {
    heading: Schema.Attribute.String;
    steps: Schema.Attribute.Component<'services.process-step', true>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface ServicesProcessStep extends Struct.ComponentSchema {
  collectionName: 'components_services_process_steps';
  info: {
    displayName: 'Process Step';
    icon: 'stack';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ServicesTestimonialTab extends Struct.ComponentSchema {
  collectionName: 'components_services_testimonial_tabs';
  info: {
    displayName: 'Testimonial Tab';
    icon: 'layer';
  };
  attributes: {
    label: Schema.Attribute.String;
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
  };
}

export interface ServicesUsp extends Struct.ComponentSchema {
  collectionName: 'components_services_usps';
  info: {
    displayName: 'USP';
    icon: 'star';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    items: Schema.Attribute.Component<'shared.usp-item', true>;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface SharedButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_buttons';
  info: {
    displayName: 'Button';
    icon: 'cursor';
  };
  attributes: {
    label: Schema.Attribute.String;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    url: Schema.Attribute.String;
    variant: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'outline', 'link']
    > &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface SharedCtaBanner extends Struct.ComponentSchema {
  collectionName: 'components_shared_cta_banners';
  info: {
    displayName: 'CTA Banner';
    icon: 'bell';
  };
  attributes: {
    button: Schema.Attribute.Component<'shared.button', false>;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    subheading: Schema.Attribute.Text;
    tag: Schema.Attribute.Component<'shared.tag', false>;
  };
}

export interface SharedPageHero extends Struct.ComponentSchema {
  collectionName: 'components_shared_page_heros';
  info: {
    displayName: 'Page Hero';
    icon: 'picture';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'Seo';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String;
    shareImage: Schema.Attribute.Media<'images'>;
    structuredData: Schema.Attribute.JSON;
  };
}

export interface SharedSlideButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_slide_buttons';
  info: {
    displayName: 'Slide Button';
    icon: 'cursor';
  };
  attributes: {
    defaultLabel: Schema.Attribute.String;
    hoverLabel: Schema.Attribute.String;
    url: Schema.Attribute.String;
    variant: Schema.Attribute.Enumeration<['primary', 'secondary', 'outline']> &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface SharedTag extends Struct.ComponentSchema {
  collectionName: 'components_shared_tags';
  info: {
    displayName: 'Tag';
    icon: 'price-tag';
  };
  attributes: {
    label: Schema.Attribute.String;
  };
}

export interface SharedUspItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_usp_items';
  info: {
    displayName: 'USP Item';
    icon: 'star';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'about.benefit-item': AboutBenefitItem;
      'about.benefits': AboutBenefits;
      'about.brand-culture': AboutBrandCulture;
      'about.brand-culture-tab': AboutBrandCultureTab;
      'about.case-studies': AboutCaseStudies;
      'about.founder-quote': AboutFounderQuote;
      'about.location-item': AboutLocationItem;
      'about.locations': AboutLocations;
      'about.logo-item': AboutLogoItem;
      'about.logo-marquee': AboutLogoMarquee;
      'about.team': AboutTeam;
      'about.timeline': AboutTimeline;
      'about.timeline-item': AboutTimelineItem;
      'about.vision-mission-values': AboutVisionMissionValues;
      'case-studies.list': CaseStudiesList;
      'case-study.highlight': CaseStudyHighlight;
      'contact.get-in-touch': ContactGetInTouch;
      'contact.hubspot-form': ContactHubspotForm;
      'contact.info-item': ContactInfoItem;
      'elements.certification-logo': ElementsCertificationLogo;
      'elements.faq-item': ElementsFaqItem;
      'elements.feature-card': ElementsFeatureCard;
      'elements.footer-column': ElementsFooterColumn;
      'elements.footer-cta-banner': ElementsFooterCtaBanner;
      'elements.footer-link': ElementsFooterLink;
      'elements.footer-location': ElementsFooterLocation;
      'elements.footer-newsletter': ElementsFooterNewsletter;
      'elements.nav-item': ElementsNavItem;
      'elements.nav-link': ElementsNavLink;
      'elements.rotating-word': ElementsRotatingWord;
      'elements.service-card': ElementsServiceCard;
      'elements.service-tab': ElementsServiceTab;
      'elements.social-link': ElementsSocialLink;
      'elements.title-segment': ElementsTitleSegment;
      'layout.footer': LayoutFooter;
      'layout.navbar': LayoutNavbar;
      'process.timeline': ProcessTimeline;
      'process.timeline-step': ProcessTimelineStep;
      'product.source-item': ProductSourceItem;
      'products.certifications': ProductsCertifications;
      'products.hero': ProductsHero;
      'products.product-list': ProductsProductList;
      'resources.download-cta': ResourcesDownloadCta;
      'resources.free-resources': ResourcesFreeResources;
      'resources.insights': ResourcesInsights;
      'resources.lead-capture': ResourcesLeadCapture;
      'sections.case-studies': SectionsCaseStudies;
      'sections.faq': SectionsFaq;
      'sections.featured-resources': SectionsFeaturedResources;
      'sections.hero': SectionsHero;
      'sections.mission-video': SectionsMissionVideo;
      'sections.partners': SectionsPartners;
      'sections.sourcing-services': SectionsSourcingServices;
      'sections.testimonial-carousel': SectionsTestimonialCarousel;
      'sections.why-choose-us': SectionsWhyChooseUs;
      'services.category-showcase': ServicesCategoryShowcase;
      'services.category-tab': ServicesCategoryTab;
      'services.hero': ServicesHero;
      'services.offering-item': ServicesOfferingItem;
      'services.offerings': ServicesOfferings;
      'services.process': ServicesProcess;
      'services.process-step': ServicesProcessStep;
      'services.testimonial-tab': ServicesTestimonialTab;
      'services.usp': ServicesUsp;
      'shared.button': SharedButton;
      'shared.cta-banner': SharedCtaBanner;
      'shared.page-hero': SharedPageHero;
      'shared.seo': SharedSeo;
      'shared.slide-button': SharedSlideButton;
      'shared.tag': SharedTag;
      'shared.usp-item': SharedUspItem;
    }
  }
}
