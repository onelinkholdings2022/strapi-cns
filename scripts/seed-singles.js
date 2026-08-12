'use strict';
const { blocks, tag, btn, upsertSingle } = require('./seed-lib');
const usp = (arr) => arr.map(([title, description]) => ({ title, description }));
const faqItems = (arr) => arr.map(([question, ...paras]) => ({ question, answer: blocks(...paras) }));

const FAQ_CONTACT = { contactText: 'Still have questions? Reach out to us at', contactEmail: 'info@chinasourcing.co' };
const HUBSPOT_MAIN = { portalId: '46681098', formId: '216cfe97-ca6b-4edd-bcd6-eca85d0d4a5a', region: 'na1' };
const HUBSPOT_NEWSLETTER = { portalId: '46681098', formId: 'e30221f0-7060-4147-9b7b-4dc9593f7828', region: 'na1' };

const SIX_USPS = usp([
 ['Work With Local Experts','Manage all parts of the supply chain to ensure you’re truly happy with the results.'],
 ['Remove Language Barriers','Communicate effortlessly with our fluent, English-speaking local team.'],
 ['Simplify Communication','Coordinate all moving parts of the supply chain through a single point of contact for faster, smoother execution.'],
 ['Reduce Sourcing Costs','Leverage our trusted supplier network to secure more competitive pricing.'],
 ['Use Trusted Factories','Work with vetted factories we’ve already tested and approved.'],
 ['Ensure Product Quality','Conduct inspections at every stage to guarantee consistent, high-quality products.'],
]);

const CATEGORY_TABS = (pm, descs) => [
 ['furniture', descs[0]], ['packaging', descs[1]], ['gym-fitness', descs[2]],
 ['building-materials', descs[3]], ['textiles-garments', descs[4]],
].map(([slug, description]) => ({ product: pm[slug] ? { connect: [pm[slug]] } : undefined, description }));

async function seedSingles(strapi, { productMap, caseStudyMap, serviceMap, catMap, teamIds }) {
  const cs3 = ['tag-apparel','prestige-residential','muscle-mat'].map(s => caseStudyMap[s]).filter(Boolean);
  const csRel = { connect: cs3 };

  // ============ GLOBAL (navbar + footer + SEO mặc định) ============
  await upsertSingle(strapi, 'api::global.global', {
    defaultSeo: {
      metaTitle: 'China Sourcing Co. | Sourcing & Manufacturing in Asia',
      metaDescription: 'We help businesses source, manufacture and ship products from Asia — factory vetting, quality control, freight and logistics, all handled by our on-the-ground team.',
      keywords: 'china sourcing, sourcing agent china, manufacturing in asia, quality control, freight and logistics',
      canonicalURL: 'https://chinasourcing.co',
    },
    navbar: {
    menuItems: [['Home','/'],['About Us','/about-us'],['Services','/services'],['Products','/products'],
      ['Process','/process'],['Case Studies','/case-studies'],['Resources','/resources']]
      .map(([label,url]) => ({ label, url })),
    ctaButton: btn('Contact Us','/contact-us'),
    },
    footer: {
    newsletter: { eyebrow:'Stay Ahead in Sourcing', heading:'Actionable Insights', placeholder:'Enter your email', buttonLabel:'Submit' },
    newsletterForm: HUBSPOT_NEWSLETTER,
    linkColumns: [
      { title:'EXPLORE US', hasSeeMore:false, links:[['About Us','/about-us/'],['Case Studies','/case-studies/'],['Resources','/resources/'],['Contact Us','/contact-us/']].map(([label,url])=>({label,url})) },
      { title:'OUR PRODUCTS', hasSeeMore:true, seeMoreUrl:'/products/', links:[['Furniture','/product/furniture'],['Bags & Cases','/product/bags-cases'],['Building Materials','/product/building-materials'],['Chemicals & Cleaning','/product/chemicals-cleaning']].map(([label,url])=>({label,url})) },
      { title:'OUR SERVICES', hasSeeMore:true, seeMoreUrl:'/services/', links:[['Product Sourcing','/service/sourcing-service'],['Quality Control','/service/quality-control'],['Freight & Logistics','/service/freight-logistics'],['Custom Manufacturing','/service/custom-manufacturing']].map(([label,url])=>({label,url})) },
    ],
    locations: [
      ['China','Jinbin Tengyuue Mansion, South Tower, No.49 Huaxia Road, Tianhe District, Guanzhou city, Guangdong Province, China','bheki@onelinkholdings.com'],
      ['Hongkong','Unit D, 16/F, One Capital Place, 18 Luard Road, Wan Chai - Hong Kong','tom@onelinkholdings.com'],
      ['Vietnam','771 Ngo Quyen Street, An Hai Bac Ward, Son Tra District, Da Nang city, Vietnam','kady@onelinkholdings.com'],
      ['Brisbane, Australia','Stafford St, Brisbane 4169, QLD, Australia','sam@onelinkholdings.com'],
      ['Sydney, Australia','Allenby Park Parade, Sydney, Allambie Heights, NSW, Australia - 2100','lee@onelinkholdings.com'],
    ].map(([name,address,email]) => ({ name, address, email })),
    socialMedia: [
      ['Facebook','https://www.facebook.com/chinasourcing.co'],
      ['Linkedin','https://www.linkedin.com/company/china-sourcing-co/'],
      ['Instagram','https://www.instagram.com/chinasourcing.co/'],
    ].map(([name,url]) => ({ name, url })),
    copyright: '2026 © China Sourcing Co. All Rights Reserved',
    legalLinks: [{ label:'Privacy Policy', url:'/privacy-policy' }],
    ctaBanner: { marqueeText:"Interested in working together? Let's discuss.", hoverLabel:'Say Hi!', contactUrl:null },
    },
  });

  // ============ CONTACT DIALOG ============
  await upsertSingle(strapi, 'api::contact-dialog.contact-dialog', {
    headingLine1:'Get In Touch', headingLine2:'With Us today!',
    description:"Drop your contact details into the form, and we’ll reach out to you!",
    contactLabel:'Or reach out to us at', email:'info@chinasourcing.co', form: HUBSPOT_MAIN,
  });

  // ============ CONTACT PAGE ============
  await upsertSingle(strapi, 'api::contact-page.contact-page', {
    hero: { heading:'Contact Us', description:'Whether you need a quick quote or full sourcing support, our team is here to help.' },
    getInTouch: {
      tag: tag('Get In Touch'),
      heading: "We're here to help and answer any questions you may have",
      description: 'Discover how we can help your business achieve its supply chain goals with tailored solutions and expert support.',
      infoItems: [
        { label:'Email', value:'info@chinasourcing.co', href:'mailto:info@chinasourcing.co' },
        { label:'Phone', value:'(+84) 866 360 817', href:'tel:+84866360817' },
        { label:'Headquarters', value:'Jinbin Tengyuue Mansion, South Tower, No.49 Huaxia Road, Tianhe District, Guangzhou city, Guangdong Province, China' },
      ],
      socialLabel:'Social',
      socialLinks: [
        { name:'LinkedIn', url:'https://www.linkedin.com/company/onelink-holdings/' },
        { name:'Facebook', url:'https://www.facebook.com/onelinkholdings' },
        { name:'Instagram', url:'https://www.instagram.com/onelink_sourcing/' },
      ],
      form: HUBSPOT_MAIN,
    },
    whatHappensNext: { tag: tag('Next Steps'), heading:'What Happens Next', steps: [
      ['We start with','Notification','A confirmation email will be sent, and our team will get back to you within 24 hours.'],
      ['And Then','Contact','A member of our team will reach out to learn more about your requirements and how we can best assist you.'],
      ['After That','Discussion','We work with you to create a detailed product requirements brief tailored to your needs.'],
      ['Finally','Quote','We’ll provide you with the best options and pricing, helping you make an informed decision.'],
    ].map(([label,title,description]) => ({ label, title, description })) },
  });

  // ============ PROCESS PAGE ============
  await upsertSingle(strapi, 'api::process-page.process-page', {
    hero: { heading:'Our Process', description:'From product selection to delivery, our team works as an extension of yours to ensure every detail meets your standards and moves your business forward.' },
    timeline: { tag: tag('Our Process'), heading:'How We Make Sourcing Work',
      description:'You remain in control while we manage every detail, from quote to shipment.',
      steps: [
        ['Step 1','Enquire','Speak to our team to align on your requirement and build out your product brief.'],
        ['Step 2','Quote','Once we have negotiated your requirements with our preferred manufacturers, we will promptly submit our price proposal to you.'],
        ['Step 3','Sample & Design','Sample and design confirmation are integral elements that instill confidence in the product you will receive. By thoroughly reviewing and validating samples and designs, we ensure that the final product meets your expectations.'],
        ['Step 4','Confirmation','Order confirmation is finalized upon receipt of your deposit payment.'],
        ['Step 5','Production','Production commences on the goods and the agreed-upon production timeline (roughly around 3-6 weeks) which is closely monitored by our on-the-ground team.'],
        ['Step 6','Quality Assurances','We implement comprehensive quality control measures throughout production to ensure all standards are met.'],
        ['Step 7','Final inspection and balance','Upon the completion of production, our team will conduct a thorough quality inspection to ensure the goods meet the highest standards before the balance is paid.'],
        ['Step 8','Freight and Logistics','Once the final payment is received, we organize freight and delivery from our warehouse to your specified address.'],
      ].map(([label,title,description]) => ({ label, title, description })) },
    usp: { tag: tag('Why This Process Works'), heading:'Your Trusted Sourcing & Procurement Partner in Asia',
      description:'We deliver the highest quality products at the best possible price.',
      items: usp([
        ['No Guesswork','You’ll always know exactly what’s happening and when - no surprises, just transparency.'],
        ['Supplier Filters','We partner exclusively with trusted factories that pass our rigorous vetting process.'],
        ['Built for Your Needs','Whether you need one SKU or fifty, enjoy a single point of contact while we manage everything else.'],
        ['Local Eyes, Global Reach','Our on-the-ground team acts in your best interests, ensuring seamless communication and flawless execution.'],
        ['Quality Control at Every Stage','From contract terms to final quality checks, we help mitigate risks and ensure you avoid costly mistakes.'],
      ]) },
    faq: { tag: tag('Common Questions'), title:'Frequently Asked', titleHighlight:'Questions', ...FAQ_CONTACT,
      items: faqItems([
        ['Do you manage the entire supply chain from start to finish?','Yes, we handle the entire process, from sourcing and vetting suppliers to overseeing production and managing logistics. Our team ensures that all timelines, quality control standards, and compliance requirements are met throughout.'],
        ['What are your lead times for sourcing and delivery?','Lead times vary depending on the product type and order size. On average, we can source products and provide samples within 1-2 weeks. Full production and delivery typically take between 4 to 8 weeks. We handle negotiations with suppliers on your behalf and provide regular updates to ensure you’re informed throughout the entire process.'],
        ['What happens if there’s a delay in the supply chain?','We actively monitor production and shipping timelines. If there is any risk of delay, we communicate with you promptly and work with the supplier to resolve the issue, minimizing any impact on your business.'],
        ['How do I track my order during production and shipping?','We provide regular updates throughout the sourcing, production, and shipping phases. You’ll receive status reports and tracking information to stay informed every step of the way.'],
      ]) },
    ctaBanner: { tag: tag('Let Us Manage Your Supply Chain'), heading:"Ready to work with a sourcing team that’s built for real-world results?",
      subheading:'From sourcing to delivery, we handle every aspect of your supply chain with precision, ensuring smooth operations and timely results.',
      button: btn('Start Your Project', null) },
  });

  // ============ CASE STUDY SETTINGS + CASE STUDIES PAGE ============
  await upsertSingle(strapi, 'api::case-study-setting.case-study-setting', {
    relatedCaseStudiesTag: tag('Our Case Studies'),
    relatedCaseStudiesHeading: 'Explore more Case Studies',
    relatedCaseStudiesButton: btn('See All Case Studies','/case-studies/'),
    ctaBanner: { tag: tag("Let's Build Your China Supply Chain"),
      heading:'Ready to work with a sourcing team that delivers real-world results?',
      subheading:"Let's Talk And Find Your Solution.", button: btn('Talk To Our Expert', null) },
  });

  const t3 = await strapi.documents('api::testimonial.testimonial').findMany({
    filters: { authorName: { $in: ['Hanz Amada','Ken Fitzgerald','David Greer'] } }, status: 'draft' });
  await upsertSingle(strapi, 'api::case-studies-page.case-studies-page', {
    hero: { heading:'Case Studies', description:'Explore how we help clients simplify their supply chains' },
    list: { tag: tag('Client Success Stories'), heading:'Results You Can Replicate', pageSize: 12 },
    usp: { tag: tag('What We Do Best'), heading:'Why Choose Us?',
      description:'We are not just sourcing agents, we are an extension of your team on the ground. We bridge the gap between where your products are made and where your business needs them to be, ensuring a seamless, reliable supply chain.',
      items: SIX_USPS },
    testimonials: { tag: tag('From Sourcing to Success'), heading:'Why Clients Choose Us Again and Again',
      testimonials: { connect: t3.map(t => t.documentId) } },
    ctaBanner: { tag: tag("Let's Build Your China Supply Chain"), heading:'Your Story Could Be Next',
      subheading:'From first quote to final delivery, China Sourcing Co helps you simplify sourcing, reduce risks and scale with confidence.',
      button: btn('Book a Free Consultation', null) },
  });

  // ============ PRODUCT SETTINGS + PRODUCTS PAGE ============
  await upsertSingle(strapi, 'api::product-setting.product-setting', {
    testimonialsTag: tag('Testimonials'),
    testimonialsButton: btn('Explore More Case Studies','/case-studies/'),
    uspTag: tag('Our USPs'),
    defaultUsps: usp([
      ['Diverse Product Range','We offer a wide selection of products across various industries, catering to different market needs.'],
      ['High Customization Options','We provide high customization options, allowing our products to be fully customized in terms of design, material and functionality to align with your brand identity.'],
      ['Reliability and Consistency','We deliver consistent, high-quality products every time, meeting your business needs, with a proven track record.'],
      ['Transparent Sourcing Process','We ensure full transparency, from sourcing to delivery, so you can track every step of the process.'],
      ['Scalable Solutions','We provide scalable solutions to meet your demands, whether you’re a startup or a large corporation.'],
      ['Product Quality Assurance','We conduct inspections at every stage of production to ensure consistent, high-quality results that meet your exact specifications.'],
    ]),
    faqTag: tag('Our FAQs'), faqHeading:'Frequently Asked', faqHeadingHighlight:'Questions',
    faqContactText: FAQ_CONTACT.contactText, faqContactEmail: FAQ_CONTACT.contactEmail,
  });

  await upsertSingle(strapi, 'api::products-page.products-page', {
    hero: { titlePrefix:'Source', title:'All in One Place',
      subtitle:'Simplifying Sourcing & Manufacturing Across Industries',
      rotatingWords: ['Textiles & Garments','Furniture','Bags & Cases','Packaging','Bedding & Home','Household Appliances','Food & Drinks','Corporate & Promotional Products','Building Materials','Hospitality Items','Chemicals & Cleaning','Gym & Fitness','Hardware & Tools','Point of Sale','Automotive Parts & Machinery'].map(text => ({ text })),
      ctaButton: btn('Get a Free Quote','/contact-us/') },
    productList: { tag: tag('Product Categories'), heading:'Our Product Range',
      description:'We source high-quality products across industries. If you don’t see what you need, reach out for custom sourcing solutions.',
      cardButtonLabel:'See Product Detail' },
    caseStudies: { tag: tag('Real Outcomes'), title:'Explore Real Businesses.\nReal Results.',
      ctaButton: btn('See All Case Studies','/case-studies/'), featuredCaseStudies: csRel },
    certifications: { tag: tag('Certifications & Compliance'), heading:'Certified Supply Chains You Can Trust',
      description:'We work with factories that meet international standard' },
    partners: { tag: tag('Our Partners'), title:'Certified Supply Chains', titleHighlight:'You Can Trust',
      ctaButton: btn('Explore Our Products','/products') },
    faq: { tag: tag('Common Questions'), title:'Frequently Asked', titleHighlight:'Questions (FAQs)', ...FAQ_CONTACT,
      items: faqItems([
        ['What types of products can you help me source?','We source a wide variety of products across 14+ categories. If your product isn’t listed, speak to our team today - whatever your industry, we’ll find the right suppliers to meet your needs.'],
        ['How do you ensure product quality?','We work exclusively with trusted, vetted suppliers and conduct thorough quality checks at multiple stages-before shipment and upon delivery - to ensure your products meet your standards.'],
        ['Can you handle negotiations and supplier communication?','Absolutely. Our experienced team handles all negotiations and supplier communications in local languages and dialects to secure the best pricing and terms - saving you time and effort.'],
        ['What are your minimum order quantities (MOQs)?','MOQs vary depending on the product and factory. We’ll help you find the best fit and negotiate on your behalf, whether you\'re ordering small batches or large volumes.'],
        ['Do you assist with shipping and logistics?','Yes, our team coordinate cost-effective shipping and handle logistics to deliver your products safely and on time.'],
      ]) },
    ctaBanner: { tag: tag("Let's Build Your China Supply Chain"),
      heading:'Ready to work with a sourcing team that delivers real-world results?',
      subheading:'From first quote to final delivery, China Sourcing Co helps you simplify sourcing, reduce risks, and scale with confidence.',
      button: btn('See real results','/case-studies') },
  });

  // ============ SERVICE SETTINGS + SERVICES PAGE ============
  const resDocs = await strapi.documents('api::resource.resource').findMany({
    filters: { slug: { $in: ['the-hidden-profit-leak-most-ecommerce-brands-ignore','incoterms-explained','intro-to-china-manufacturing'] } }, status: 'draft' });
  const resRel = { connect: resDocs.map(r => r.documentId) };

  await upsertSingle(strapi, 'api::service-setting.service-setting', {
    cardTag: tag('Our Core Services'), cardButtonLabel:'See Service Detail',
    categoryShowcase: { tag: tag('Our Products'), heading:'Explore by Category',
      description:'We specialize in sourcing across key industries:',
      button: btn('Explore full product categories','/products/'),
      tabs: CATEGORY_TABS(productMap, [
        'From office desks and ergonomic chairs to home sofas, dining sets, and outdoor furniture, we help you source a wide range of high-quality furniture.',
        'From custom boxes and protective materials to eco-friendly options, we help you source reliable packaging solutions that fit your product and brand.',
        'From yoga mats and dumbbells to cardio machines and fitness accessories, we help you source a wide variety of high-quality gym and fitness equipment.',
        'From structural steel and timber to insulation panels and finishing materials, we help you source a broad selection of reliable, high-quality, certified building materials.',
        'From fabrics and yarns to finished apparel and custom garments, we help you source high-quality textiles and garments to meet your production needs.',
      ]) },
    testimonialsTag: tag('Testimonials'), testimonialsHeading:'Explore Real Businesses',
    testimonialTabs: [
      ['Furniture & Interior','furniture'],['Gym & Fitness Products','gym-fitness'],
      ['Promotional Products','corporate-promotional-products'],['Point of Sale','point-of-sale'],
      ['Machinery','automotive-machinery'],['Hospitality Items','hospitality-items'],
      ['Household Appliances','household-appliances'],
    ].map(([label, slug]) => ({ label, product: productMap[slug] ? { connect: [productMap[slug]] } : undefined })),
    faqTag: tag('Our FAQs'), faqHeading:'Frequently Asked', faqHeadingHighlight:'Questions',
    faqContactText: FAQ_CONTACT.contactText, faqContactEmail: FAQ_CONTACT.contactEmail,
    relatedResources: { tag: tag('Our Resources'), title:'Related', titleHighlight:'Resource',
      viewAllButton: btn('See All Resources','/resources'), featuredResources: resRel },
    otherServicesTag: tag('Other Services You Might Need'), otherServicesHeading:'Our Services',
    otherServicesButton: btn('Explore our full-service overview','/services'),
    ctaBanner: { tag: tag('Contact Us Right Today'),
      heading:'Ready to work with a sourcing team that’s built for real-world results?',
      subheading:"Let's Talk And Find Your Solution.", button: btn('Talk to our Expert', null) },
  });

  await upsertSingle(strapi, 'api::services-page.services-page', {
    hero: { title:'All In One Place',
      description:'We provide tailored sourcing solutions, from finding your factory to delivering the final product.',
      rotatingWords: ['Sourcing','Manufacturing','Quality Control','Freight & Logistics'].map(text => ({ text })) },
    process: { tag: tag('Our Process'), heading:'How We Source', steps: [
      ['We start with','Product Briefing & Consultation','We take the time to understand your needs and ensure we’re fully aligned with your goals.'],
      ['And then','Supplier Sourcing & Vetting','Our team identifies the ideal manufacturer based on your specific requirements.'],
      ['Move to','Sample & Quotation','Receive transparent pricing, clear timelines, and physical samples for your approval.'],
      ['Follow By','Production Oversight','We coordinate, oversee, and manage every stage of the supply chain to ensure your satisfaction at every step.'],
      ['After that','Quality Control','We implement rigorous quality control measures at every stage of the supply chain to ensure the highest standards.'],
      ['Finally','Freight & Delivery','We manage your freight and delivery to ensure your goods arrive on time and in perfect condition.'],
    ].map(([label,title,description]) => ({ label, title, description })) },
    categoryShowcase: { tag: tag('Our Products'), heading:'Explore by Category',
      description:'Looking for solutions by product type? Visit our Product Overview page to explore real-world applications across:',
      button: btn('See All Products','/products'),
      tabs: CATEGORY_TABS(productMap, [
        'Sourced from our trusted manufacturing partners, tailored to meet your exact needs.',
        'From custom boxes and protective materials to eco-friendly options, we help you source reliable packaging solutions that fit your product and brand.',
        'From weights and resistance bands to cardio machines and yoga accessories, we help you source high-quality gym and fitness equipment to suit every workout.',
        'From structural steel and timber to insulation and finishing materials, we help you source reliable, high-quality building materials for any project.',
        'From fabrics and yarns to finished apparel and custom garments, we help you source high-quality textiles and garments to meet your production needs.',
      ]) },
    usp: { tag: tag('Our USPs'), heading:'Why Choose China Sourcing Co?',
      description:'We are more than just sourcing agents, we are an extension of your team, working on the ground to bridge the gap between manufacturers and your business needs.',
      items: usp([
        ['No Upfront Fees',"We only engage when you're ready to move forward - no fees until you're ready to take action."],
        ['Verified Factories','We work exclusively with trusted, verified manufacturing partners to ensure quality and reliability.'],
        ['Transparent Pricing','We offer clear, upfront pricing-leveraging our strong supply chain relationships to provide you with the best value.'],
        ['Local Execution','Our team is on the ground inside the factories, ensuring direct oversight and seamless coordination.'],
      ]) },
    caseStudies: { tag: tag('Our Case Studies'), title:'Explore Real Businesses.\nReal Results.',
      ctaButton: btn('View more in our Case Study Library','/case-studies'), featuredCaseStudies: csRel },
    resources: { tag: tag('Our Resources'), title:'Resources to', titleHighlight:'Get Started',
      viewAllButton: btn('Explore our full Resource Hub','/resources'), featuredResources: resRel },
    ctaBanner: { tag: tag('Contact Us Today'), heading:"Let's Build Smarter Supply Chains",
      subheading:'Get in touch with us today for a free quote!', button: btn('Talk to our Sourcing Expert', null) },
  });

  // ============ RESOURCE SETTINGS + RESOURCES PAGE ============
  await upsertSingle(strapi, 'api::resource-setting.resource-setting', {
    leadCapture: { tag: tag('Free Resources Right Here'),
      heading:'Enter your email to gain full access to our resources',
      subheading:'Get exclusive access from expert insights to streamline your supply chain.',
      placeholder:'Enter your email', buttonLabel:'Submit' },
    relatedResourcesTag: tag('Free Resources'),
    relatedResourcesHeading:'Explore More Relative Resources',
    relatedResourcesButton: btn('See All Resources','/resources'),
    ctaBanner: { tag: tag('Contact Us Right Today'),
      heading:"Ready to work with a sourcing team that's built for real-world results?",
      subheading:'From first quote to final delivery, China Sourcing Co helps you simplify sourcing, reduce risks, and scale with confidence.',
      button: btn('Book a Free Consultation', null) },
  });

  await upsertSingle(strapi, 'api::resources-page.resources-page', {
    hero: { heading:'Resources for Smarter Sourcing',
      description:'With deep expertise in China sourcing, global trade, and eCommerce, we are here to share it all to help your business run smoother and scale faster.' },
    freeResources: { tag: tag('Free Resources'), heading:'Everything You Need to Source Smarter' },
    insights: { tag: tag('Sourcing Insights'), heading:'Smart Sourcing Begins with Informed Insights',
      description:'Discover what truly drives success in supply chains', pageSize: 12 },
    downloadCta: { tag: tag('Free Download'), heading:'Your Gateway to Smarter Sourcing',
      description:'Everything you need to source with clarity, cost-efficiency, and confidence.', buttonLabel:'Download' },
    faq: { tag: tag('Common Questions'), title:'Frequently Asked', titleHighlight:'Questions', ...FAQ_CONTACT,
      items: faqItems([
        ['Do I Need to Pay to Download These Resources?','No, all downloads are completely free - simply provide your email to access them.'],
        ['What Kind of Files Will I Receive?','You’ll receive the same resources that multinational brands use to achieve the best results. Just choose the resource that interests you.'],
        ['Are These Resources Suitable for New Importers?',"Absolutely. Whether you're a first-time buyer or a seasoned sourcing expert, these proven systems are designed to work for everyone."],
        ['Can I Share These Resources with My Team?','Absolutely! We encourage you to share these resources internally to help your team improve processes and source more effectively.'],
        ['Will I Receive Updates When New Resources Are Added?','Yes! Stay subscribed, and we’ll keep you informed whenever new resources are available.'],
      ]) },
  });

  console.log('  • 12 single type (chung) đã seed — gồm global (navbar + footer + defaultSeo)');
}

module.exports = { seedSingles };
