'use strict';
/** Nội dung THẬT của Homepage + About Us (bóc từ chinasourcing.co ngày 2026-08-11). */
const { blocks, tag, btn, upsertSingle, upsertByField } = require('./seed-lib');
const TEAM_BIOS = require('./team-bios.json');
const item = (arr) => arr.map(([title, description]) => ({ title, description }));

const ECOM_CARDS = [
 ['Product Sourcing','Sourcing, negotiation, QA and cost-effective procurement, our local team delivers fast, reliable solutions from Asia’s top manufacturing hubs.'],
 ['Quality Control','Ensure quality from raw materials to delivery. Conduct audits, inspect production and apply strict QA across every stage of the sourcing process.'],
 ['Freight & Logistics','Oversee end-to-end delivery. Offer air, sea, road and rail freight with cost-effective, flexible options to get your goods where they need to be.'],
 ['Warehousing & Fulfillment','Manage storage and fulfillment with ease. Optimize inventory, speed up delivery and ensure accurate, on-time order processing every step of the way.'],
 ['Product Research','Identify winning products with in-house research. Analyze demand, competition and margin to suggest what to sell and how to position it for success.'],
 ['Graphic Design','Deliver high-impact branding at lower cost. Design logos, build brand identity and create guidelines without compromising on quality or budget.'],
 ['Photo & Videography','Produce stunning photos and videos with our Asia-based team. Leverage talent, scenery and cost savings without sacrificing quality.'],
 ['Content Creation (UGC)','Outsource UGC to Asia for cost savings, fast turnaround, multilingual talent and cultural insight so you can stay focused on your core business.'],
];
const BIZ_CARDS = [
 ['Factory & Supplier Audit','Conduct factory audits covering QMS, social compliance, HSE and supply chain security, ensuring your suppliers meet global standards and client expectations.'],
 ['IP Protection','Protect your IP with tailored contracts and NDAs. Work confidently with factories worldwide knowing your designs and ideas stay exclusively yours.'],
 ['Sourcing & Procurement','Simplify your supply chain with one point of contact. Manage trusted or existing suppliers through our multilingual team for a smooth, end-to-end experience.'],
 ['Quality Control','Ensure quality at every step, from raw material checks to audits, in-line and final inspections and container loading for consistently high product standards.'],
 ['Freight & Logistics','Manage freight end-to-end with air, sea, road and rail options. Deliver goods seamlessly while giving you flexible, cost-effective shipping control.'],
 ['Warehousing & Fulfillment','Outsource logistics to trusted 3PL partners. Streamline your supply chain and enhance customer experience with fast, seamless order fulfillment.'],
 ['Custom Manufacturing','Develop custom products with precision. Turn concepts into scalable, production-ready goods, tailored to your specs, budget, and market needs.'],
];
const card = ([title, description]) => ({ title, description, linkLabel: 'Get A Free Quote', linkUrl: '/contact-us/' });

async function seedHomepage(strapi, { csRel, resRel }) {
  await upsertSingle(strapi, 'api::homepage.homepage', {
    hero: {
      title: "BRINGING ASIA'S BEST FACTORIES TO YOU",
      subtitle: 'Your Trusted Sourcing & Procurement Partner in Asia.',
      rotatingWords: ['Simple','High Quality','Risk Free','Reliable','Compliant','Flexible','Transparent'].map(text => ({ text })),
      ctaButton: { defaultLabel: 'Say Hi!', hoverLabel: 'Book a Free Consultation', url: '/contact-us', variant: 'primary' },
      videoUrl: 'https://player.vimeo.com/video/1085559478?h=9b06144894&badge=0&autopause=0&autoplay=1&muted=1&loop=1',
    },
    sourcingServices: { tag: tag('Our Services'), title: 'Our Trusted Services', tabs: [
      { label: 'For E-commerce', cards: ECOM_CARDS.map(card) },
      { label: 'For Medium to Large Businesses', cards: BIZ_CARDS.map(card) },
    ]},
    whyChooseUs: { tag: tag('What We Do Best'), title: 'We Simplify Sourcing',
      ctaButton: btn('Talk To Our Expert', null),
      features: item([
        ['Work With Local Experts','Work with our on the ground team to ensure everything meets your standards.'],
        ['Remove Language Barriers','Communicate clearly with our fluent, English-speaking team.'],
        ['Simplify Communication','Coordinate through one point of contact for all of your supply chain needs.'],
        ['Maximize Profits','Access better prices through our strong supplier relationships.'],
        ['Use Trusted Factories','Work with our trusted manufacturing partners that we’ve already tested and approved.'],
        ['Ensure Product Quality','Inspections at every stage to guarantee consistent, high-quality output.'],
      ]) },
    caseStudies: { tag: tag('Real Outcomes'), title: 'Explore Real Businesses.\nReal Results.',
      ctaButton: btn('See All Case Studies','/case-studies'), featuredCaseStudies: csRel },
    partners: { tag: tag('Manufacturing Network'), title: 'Our Trusted', titleHighlight: 'Manufacturing Partners',
      ctaButton: btn('Explore Our Products','/products') },
    featuredResources: { tag: tag('Insight & Guides'), title: 'Latest Sourcing Insights',
      viewAllButton: btn('See All Resources','/resources'), featuredResources: resRel },
    missionVideo: {
      titleSegments: [['We deliver the', false], ['highest quality products', true], ['at the best possible price.', false]]
        .map(([text, highlight]) => ({ text, highlight })),
      subtitle: 'We simplify supply chains with expert sourcing, factory partnerships, quality control and seamless logistics all from Asia.',
      // Nút thứ 2 TẢI FILE PDF, không điều hướng: url = null, FE lấy từ missionVideo.guideFile (Media)
      // → chờ chủ dự án upload PDF vào field `guideFile` của chính section này.
      buttons: [btn('Request A Free Quote','/contact-us'), btn('Download A Sourcing Guide', null,'outline')] },
    faq: { tag: tag('Common Questions'), title: 'Frequently Asked', titleHighlight: 'Questions',
      contactText: 'Still have questions? Reach out to us at', contactEmail: 'info@chinasourcing.co',
      items: [
        ['How do I know your factories are actually reliable?','We verify our manufacturing partners using stringent criteria. Every factory is thoroughly vetted, tested, and approved by our team before any collaboration begins.'],
        ['How do you handle product defects?','We inspect every product before it ships to ensure quality. If there’s ever an issue, our team is quick to respond and committed to resolving it.'],
        ['Can I really get better pricing without sacrificing quality?','Leverage our buying power and established relationships with supply chain partners to secure the best possible pricing.'],
        ['How do you handle quality issues if something goes wrong?','We’re on the ground. That means fast response, real inspections and problem-solving before things ever reach your warehouse.'],
        ['How do I stay in control if I’m not physically in Asia?','Our team acts as your boots on the ground, handling everything locally, while keeping you updated in real time from anywhere in the world.'],
      ].map(([question, answer]) => ({ question, answer: blocks(answer) })) },
  });
  console.log('  • homepage: nội dung thật (hero, 15 service card/2 tab, 6 USP, partners, resources, mission, 5 FAQ)');
}

async function seedAboutUs(strapi, { csRel, teamIds }) {
  // bio đầy đủ lấy nguyên văn từ site
  for (const t of TEAM_BIOS) {
    await upsertByField(strapi, 'api::team-member.team-member', 'name', t.name, { jobTitle: t.jobTitle, bio: t.bio });
  }
  await upsertSingle(strapi, 'api::about-us-page.about-us-page', {
    hero: { heading: 'About China Sourcing Co',
      description: 'Our mission is to connect you with the best factories in Asia, ensuring you get the highest quality products at the best possible prices.' },
    timeline: { tag: tag('Our Journey'), heading: 'From Vision to Impact', items: [
      ['2020','Where It All Started','After a decade of hands-on experience across China and Asia, Tom and Sam launched OneLink to provide importers with a reliable, on the ground supply chain partner they can trust.'],
      ['2021','Building the Foundation','We built a vetted factory network across China and Vietnam, formalized our QA playbook, and hired core team members across sourcing, production, quality control and freight.'],
      ['2022','Growing With Our Clients',"The addition of new brands across industries, including hotel furniture and packaging, led to a doubling in order volume, validating our model's ability to scale while maintaining full operational control."],
      ['2023','Going Global','With the launch of our Australia office, clients now benefit from 24 hour coverage and seamless multi country sourcing across APAC, Australia, and the U.S.'],
      ['2024','Scaling With Purpose','As of 2024, OneLink has a growing team of 21 members operating across Asia, America, Australia, and Europe.'],
      ['2025','And This Is Just the Beginning','To better connect with global buyers and address their sourcing needs, we rebranded as China Sourcing Co, a name that underscores our deep expertise and strong capabilities with sourcing in China.'],
    ].map(([year,title,description]) => ({ year, title, description })) },
    founderQuote: { tag: tag('From Our Founder'), name: 'Sam Sheehan', title: 'Director',
      quote: 'We started China Sourcing Co after years of working within product-based businesses across various industries. Throughout that journey, we encountered the same recurring challenges gaps in communication, lack of transparency, delayed timelines, and a general disconnect between vision and execution.\n\nWe knew there had to be a better way, one that offered clarity, speed, and a true sense of partnership from idea to shelf. China Sourcing Co was built to be that better way.' },
    visionMissionValues: { tag: tag('Our Core Value'), heading: 'Mission, Vision & Values',
      visionTitle: 'Vision', visionText: 'Simplifying sourcing from Asia with transparency and trust for global brands.',
      missionTitle: 'Mission', missionText: 'Connecting businesses with the best factories in Asia and ensure they receive the highest quality products at the best price.',
      valuesTitle: 'Core Values', valuesText: 'China Sourcing Co is built on acting in customers’ best interests and understanding their quality needs through real experience and training.' },
    benefits: { tag: tag('What We Do Best'), heading: 'The Reasons to Choose Us',
      intro: 'We’re not just sourcing agents, we are your “on-the-ground” team, making sure you’re happy with every product you receive.',
      items: item([
        ['Work With Local Experts','Manage all parts of the supply chain to ensure you’re truly happy with the results.'],
        ['Remove Language Barriers','Communicate effortlessly with our fluent, English-speaking local team.'],
        ['Simplify Communication','Coordinate all moving parts of the supply chain through a single point of contact for faster, smoother execution.'],
        ['Reduce Sourcing Costs','Leverage our trusted supplier network to secure more competitive pricing.'],
        ['Use Trusted Factories','Work with vetted factories we’ve already tested and approved.'],
        ['Ensure Product Quality','Conduct inspections at every stage to guarantee consistent, high-quality products.'],
      ]) },
    team: { tag: tag('Humans of China Sourcing Co'), heading: 'Meet the Team',
      intro: 'We’re a team of supply chain experts strategically located around the world’s manufacturing hubs to deliver great service and ensure our clients are satisfied.',
      members: { connect: teamIds } },
    locations: { heading: 'Local teams on the ground', items: [
      ['China','Product development, factory communication, QC inspections'],
      ['Hong Kong','Supplier vetting, custom manufacturing coordination'],
      ['Vietnam','Client support, onboarding, timezone-aligned communication'],
      ['Australia','Client support, onboarding, timezone-aligned communication'],
    ].map(([countryName,description]) => ({ countryName, description })) },
    caseStudies: { tag: tag('Real Outcomes'), title: 'Explore Real Businesses.\nReal Results.',
      ctaButton: btn('See All Case Studies','/case-studies'), featuredCaseStudies: csRel },
    brandCulture: { tag: tag('Behind the Brand'), heading: 'The Why Behind Us', tabs: [
      ['Culture','How we show up, not just where we work','Culture','At China Sourcing Co, culture is reflected through our actions.\n\nWe maintain a hands-on, proactive approach with meticulous attention to detail. From factory floors in China to client communications worldwide, our team operates cohesively, built on trust, efficiency, and unwavering accountability.'],
      ['Brand Personality','How we talk, act and lead','Brand Personality','We prioritize transparency: clear, direct, and consistently reliable.\n\nNo unnecessary embellishments or empty promises, just precise execution, prompt responses, and complete visibility. This is exactly what global buyers require when sourcing from China.'],
      ['Community & Impact','Why we do more than deliver','Community & Impact','We don’t simply move products, we build stronger, more responsible supply chains.\n\nThis commitment includes fair factory practices, ethical partnerships, and a focus on long-term sustainability. Because doing business responsibly in China means doing right by all.'],
    ].map(([label,tagline,heading,description]) => ({ label, tagline, heading, description })) },
    ctaBanner: { tag: tag('Let’s Build Your China Supply Chain'),
      heading: 'Ready to work with a sourcing team that’s built for real-world results?',
      subheading: 'From first quote to final delivery, China Sourcing Co helps you simplify sourcing, reduce risks, and scale with confidence.',
      button: btn('Start Your Project', null) },
  });
  console.log('  • about-us-page: nội dung thật (hero mới, timeline, founder, VMV, 6 benefit, team 16 bio đầy đủ, locations, case studies, 3 tab brand culture, CTA)');
}

module.exports = { seedHomepage, seedAboutUs };
