'use strict';
const { blocks, tag, btn, upsertBySlug, upsertByField } = require('./seed-lib');

// ---------- 15 PRODUCT ----------
const PRODUCTS = [
 [1,'Furniture','furniture','From office desks and ergonomic chairs to home sofas, dining sets, and outdoor furniture, China Sourcing Co helps you source a wide range of high-quality furniture.'],
 [2,'Bags & Cases','bags-cases','From backpacks and laptop sleeves to travel luggage and protective equipment cases, China Sourcing Co helps you source a diverse range of durable, stylish bags and cases.'],
 [3,'Chemicals & Cleaning','chemicals-cleaning','From industrial chemicals and detergents to household cleaners and disinfectants, China Sourcing Co helps you source a wide range of effective, compliant chemicals and cleaning products.'],
 [4,'Corporate & Promotional Products','corporate-promotional-products','From branded apparel and custom drinkware to corporate gifts and event giveaways, China Sourcing Co helps you source a variety of promotional products that boost your brand visibility.'],
 [5,'Packaging','packaging','From eco-friendly boxes and flexible films to custom labels and protective packaging, China Sourcing Co helps you source a full range of packaging solutions tailored to your needs.'],
 [6,'Food & Drink Products','food-drinks','From packaged snacks and beverages to specialty ingredients and bulk food supplies, China Sourcing Co helps you source a diverse range of safe, high-quality food and drink products.'],
 [7,'Gym & Fitness','gym-fitness','From yoga mats and dumbbells to cardio machines and fitness accessories, China Sourcing Co helps you source a wide variety of high-quality gym and fitness equipment.'],
 [8,'Hardware & Tools','hardware-tools','From hand tools and power drills to fasteners and workshop equipment, China Sourcing Co helps you source a comprehensive range of durable, reliable hardware and tools.'],
 [9,'Household Appliances','household-appliances','From kitchen gadgets and small appliances to heating, cooling, and cleaning devices, China Sourcing Co helps you source a broad selection of reliable, energy-efficient household appliances.'],
 [10,'Hospitality Items','hospitality-items','From hotel linens and tableware to amenity kits and FF&E, China Sourcing Co helps you source a wide range of quality products tailored for the hospitality industry.'],
 [11,'Point of Sale','point-of-sale','From display stands and digital signage to cash registers and payment terminals, China Sourcing Co helps you source a full range of effective point of sale solutions.'],
 [12,'Automotive & Machinery','automotive-machinery','From vehicle parts and accessories to industrial machinery and equipment, China Sourcing Co helps you source a broad range of durable, high-performance automotive and machinery products.'],
 [13,'Bedding & Home','bedding-home','From mattresses and pillows to home décor and textiles, China Sourcing Co helps you source a diverse range of comfortable, stylish bedding and home products.'],
 [14,'Textiles & Garments','textiles-garments','From everyday apparel and uniforms to custom fabrics and fashion collections, China Sourcing Co helps you source a wide range of high-quality textiles tailored to your specifications.'],
 [15,'Building Materials','building-materials','From tiles and sanitaryware to insulation and doors, we help builders, contractors and developers source reliable building materials from certified manufacturers in China.'],
];

const DEFAULT_USPS = [
 ['Diverse Product Range','We offer a wide selection of products across various industries, catering to different market needs.'],
 ['High Customization Options','We provide high customization options, allowing our products to be fully customized in terms of design, material and functionality to align with your brand identity.'],
 ['Reliability and Consistency','We deliver consistent, high-quality products every time, meeting your business needs, with a proven track record.'],
 ['Transparent Sourcing Process','We ensure full transparency, from sourcing to delivery, so you can track every step of the process.'],
 ['Scalable Solutions','We provide scalable solutions to meet your demands, whether you’re a startup or a large corporation.'],
 ['Product Quality Assurance','We conduct inspections at every stage of production to ensure consistent, high-quality results that meet your exact specifications.'],
];
const usps = (arr) => arr.map(([title, description]) => ({ title, description }));

// nội dung đầy đủ cho từng product (ngoài card)
const PRODUCT_DETAIL = {
  'bags-cases': {
    heroDescription: 'We help you source a wide range of bags and protective cases directly from certified Chinese manufacturers tailored to your industry, branding and MOQ needs.',
    heroButton: btn('Talk to our Expert', '/contact-us/'),
    sourceTag: tag('What We Source in Bags & Cases'),
    sourceHeading: 'Versatile Bags & Cases Sourcing for Every Industry',
    sourceDescription: 'Our sourcing team has deep experience across both soft goods and hard-shell case manufacturing. We match your functional and aesthetic requirements with the right factory, every time.',
    sourceItems: ['Luggage','Business and Laptop Bags','Backpacks','Totes and Handbags','Specialty Cases','Outdoor and Sports Bags','Storage and Organization','Custom and Promotional Bags'].map(title => ({ title })),
    testimonialsHeading: 'Success Stories in Bags & Cases Sourcing',
    uspHeading: 'Why China Sourcing Co for Bags & Cases',
    usps: usps(DEFAULT_USPS.map(([t, d], i) => i === 2 ? [t, 'Coordinate all moving parts of the supply chain through a single point of contact for faster, smoother execution.'] : [t, d])),
    faqItems: [
      ['Can I source multiple bag types at once (e.g. tote + backpack)?','Yes. We specialize in multi-SKU sourcing and consolidate across suppliers when needed.'],
      ['Do you help with sampling and prototyping?','Absolutely. We can arrange pre-production samples with logo printing or structural changes.'],
      ['What certifications can your bag suppliers provide?','We work with suppliers compliant with REACH, BSCI, GRS (for recycling) and CPSIA if needed.'],
      ['Can you source eco-friendly materials like RPET or canvas?','Yes we have vetted factories that specialize in recycled, biodegradable and plastic-free alternatives.'],
    ].map(([question, answer]) => ({ question, answer: blocks(answer) })),
    ctaBanner: { tag: tag('Contact Us Right Today'), heading: "Let's Build Smarter Bags & Cases Supply Chains", subheading: 'Get expert help to develop, test and scale your next bag or case project.', button: btn('Start Your Project', null) },
    otherServicesSubtitle: null,
  },
  'furniture': {
    heroDescription: 'Work with trusted Chinese factories for wholesale and retail furniture.',
    heroButton: btn('Talk to our expert', '/contact-us/'),
    sourceTag: tag('What We Source in Furniture'),
    sourceHeading: 'Versatile Furniture Sourcing for Every Industry',
    sourceDescription: "Whether you're sourcing for hotels, offices, or residential brands, China Sourcing Co connects you with specialized furniture factories that deliver on design, quality, and logistics.",
    sourceItems: ['Seating Furniture','Accent Furniture','Storage Furniture','Bedroom Furniture','Outdoor Furniture',"Children's Furniture",'Entertainment Furniture','Office Furniture'].map(title => ({ title })),
    testimonialsHeading: 'Success Stories in Furniture Sourcing',
    uspHeading: 'Why China Sourcing Co for Furniture',
    usps: [],
    faqItems: [
      ['Can I order furniture in mixed materials or finishes?','Yes. We match your design specs with capable factories that handle hybrid production (e.g. wood + metal + upholstery).'],
      ['Do you support on-site inspections before shipping?','Absolutely. We coordinate third-party or internal inspections based on your quality checklist.'],
      ['How long does it take from sampling to shipment?','For standard items: 25–35 days. For custom pieces: 40–60 days depending on complexity.'],
      ['Can you help with bulk and drop shipping options?','Yes. We offer flexible shipping models depending on your distribution setup.'],
    ].map(([question, answer]) => ({ question, answer: blocks(answer) })),
    ctaBanner: { tag: tag('Contact Us Right Today'), heading: "Let's Build Smarter Furniture Supply Chains", subheading: 'From hotel rooms to retail displays, we help you find, evaluate, and manage reliable furniture factories.', button: btn('Start Your Project', null) },
  },
  'packaging': {
    heroDescription: 'From eco mailers to food containers, we help you source high-quality packaging solutions that fit your brand identity, product needs and shipping goals.',
    heroButton: btn('Talk to our Expert', '/contact-us/'),
    sourceTag: tag('What We Source in Packaging'),
    sourceHeading: 'Versatile Packaging Sourcing for Every Industry',
    sourceDescription: 'Our team offers a comprehensive range of food packaging services and products tailored to meet the diverse needs of the global food industry. Our services encompass essential elements such as packaging design, material selection, and printing and labeling options. We also provide sustainable packaging solutions, stock packaging options, and fully customizable packaging to suit individual requirements. Some of the key products we supply include:',
    sourceItems: ['Primary Packaging','Secondary Packaging','Tertiary Packaging','Flexible Packaging','Rigid Packaging','Aseptic Packaging','Vacuum Packaging','Reclosable Packaging','Biodegradable and Compostable Packaging','Edible Packaging','Paperboard Packaging','Metal Packaging'].map(title => ({ title })),
    testimonialsHeading: 'Success Stories in Packaging Sourcing',
    uspHeading: 'Why China Sourcing Co for Packaging',
    usps: [],
    faqItems: [
      ['Can you help with both structure and artwork?','Yes we support both dieline setup and printing file alignment, plus prototyping if needed.'],
      ['What printing techniques do you support?','Offset, flexo, silkscreen, digital plus embellishments like hot foil, embossing, spot UV.'],
      ['Do you offer sustainable packaging options?','Absolutely. We source FSC-certified, compostable, biodegradable and recycled materials.'],
      ['Can I run a pilot batch before committing to full production?','Yes we often arrange short-run samples before mass production to validate quality and fit.'],
    ].map(([question, answer]) => ({ question, answer: blocks(answer) })),
    ctaBanner: { tag: tag('Contact Us Right Today'), heading: "Let's Build Smarter Packaging Supply Chains", subheading: 'Better unboxing, better protection, better margins we help you source packaging that delivers on all fronts.', button: btn('Start Your Project', null) },
  },
};

async function seedProducts(strapi) {
  const map = {};
  for (const [order, title, slug, cardDescription] of PRODUCTS) {
    const detail = PRODUCT_DETAIL[slug] || {};
    map[slug] = await upsertBySlug(strapi, 'api::product.product', slug, {
      title, slug, order, cardDescription, ...detail,
    });
  }
  console.log(`  • product: ${Object.keys(map).length}`);
  return map;
}

// ---------- 16 TESTIMONIAL ----------
const TESTIMONIALS = [
 ['furniture','Hanz Amada','Founder, GetZ (Singapore)','Over 300 bespoke items were procured for our boutique hotel chain via China Sourcing Co. The entire process, encompassing factory sampling and container consolidation, was executed flawlessly.',1],
 ['furniture','Ken Fitzgerald','Co-Founder, UrbanNest Interiors (Australia)','China Sourcing Co facilitated the expansion of our direct-to-consumer furniture range across five international markets. Their personnel meticulously managed raw material procurement, design optimization, and quality control.',2],
 ['gym-fitness','Samuel Roberts','Product Director, CoreHaus (Poland)','Partner selection was driven by the need to scale our home fitness equipment line without sacrificing quality standards. China Sourcing facilitated a connection with a Nantong-based manufacturer that supplies prominent Poland brands.',1],
 ['gym-fitness','Miguel Torres','Co-founder, Iron Ritual (Canada)','Quality concerns regarding weight accuracy and surface finish for kettlebells and plates were addressed. Their team organized independent testing and refined the mold design to mitigate shipping-related damage.',2],
 ['corporate-promotional-products','Rachel Tan','Regional Marketing Director, GreenSense Labs (Singapore)',"For a regional product launch across APAC, requiring 5,000 environmentally sustainable gift sets, China Sourcing Co successfully provided a range of items including bamboo pens and bespoke packaged notebooks, all aligning with our brand's aesthetic and adhering to strict deadlines.",1],
 ['corporate-promotional-products','Craig Bolton','Brand & Events Manager, Nexon Systems (UK)','Initial concerns regarding branding quality were alleviated upon delivery. The standard of embroidery on the polo shirts and the laser engraving of the logo on the water bottles was exemplary, leading to two subsequent orders for European trade exhibitions.',2],
 ['point-of-sale','Anand Meta','Chief Technology Officer, QuickMart Retail Group (UK)','For our Southeast Asian expansion of 40 convenience stores, we required point-of-sale (POS) terminals, barcode scanners, and receipt printers compatible with our software. China Sourcing Co facilitated the procurement of dependable and economical hardware. Integration was seamless across all operational markets.',1],
 ['point-of-sale','Linh Tran','Retail Expansion Manager, Sora Apparel (Vietnam)','In our transition to brick-and-mortar stores, we sought sophisticated and contemporary POS systems aligned with our brand image. The China Sourcing Co team provided not only the requisite equipment but also customized the enclosures to correspond to our brand colors. Their service was exceptional, with meticulous attention to design.',2],
 ['automotive-machinery','Rebeca Hsu','Procurement Manager, Apex Motorsports (USA)','Our organization procures specialized engine components for the aftermarket performance automotive sector. The China Sourcing Co team facilitated the identification of manufacturers capable of meeting stringent machining tolerances, thereby optimizing cost efficiency. Comprehensive and consistent quality control documentation was provided.',1],
 ['automotive-machinery','Jean-Baptiste Leclerc','Technical Director, AgroNova Machines (France)','Our agricultural machinery division necessitated bespoke hydraulic assemblies. Previous direct supplier engagements were hampered by inefficient communication and specification deviations. The transition to China Sourcing Co has resulted in streamlined operations characterized by transparency and cost effectiveness. Their proficiency in technical terminology and linguistic translation has been invaluable.',2],
 ['hospitality-items','Emma','Procurement Director, Banyan Retreats (Italia)','For the establishment of our new resort chain within Southeast Asia, a reliable and consistent supply chain for bathrobes, slippers, and in-room kettles was imperative across five distinct countries. China Sourcing Co expertly managed the comprehensive process, encompassing sourcing, branding, and logistical operations with notable efficiency. Guests have subsequently expressed positive observations regarding the elevated quality of these amenities.',1],
 ['hospitality-items','Julien Moreau','Operations Manager, L’Horizon Hotels (France)','Our hotel conglomerate necessitated bespoke minibar provisions and environmentally sustainable toiletries for deployment across a substantial portfolio of over 2,000 guest accommodations. The personnel at China Sourcing Co orchestrated the entire procurement cycle, from the initial stages of sample validation through to the definitive packaging configuration. Their service was characterized by professionalism and meticulous attention to detail.',2],
 ['household-appliances','Laura Mitchell','Category Lead, UrbanHome Appliances (UK)','A reliable supplier of smart air fryers with Wi-Fi integration was required. China Sourcing Co identified a vetted manufacturing facility in Guangdong and facilitated the customization of the user interface for Western users, resulting in a doubling of sales in the second quarter.',1],
 ['household-appliances','Carlos Rivera','COO, Vitale Homeware (Chile)','Assistance was provided in sourcing a comprehensive line of budget-friendly blenders and rice cookers for the South American market. The sourcing team successfully negotiated more favorable minimum order quantity terms and coordinated the production of bilingual user manuals for regulatory compliance.',2],
 ['bags-cases','Elliout Donovan','Product Lead, GreenVoyage Co. (Thailand)','China Sourcing Co facilitated the development of a new line of eco-friendly travel cases through partnerships with certified factories and management of all compliance documentation across the EU and US. Their team proved to be reliable and efficient.',1],
 ['bags-cases','Liam Cho','Director of Product Development, PixelGear (UK)','A challenge arose in identifying a manufacturer capable of producing camera bags featuring high-specification interior foams and magnetic locks. China Sourcing secured a manufacturer in Fujian, effectively reducing prototyping time by 50%.',2],
 ['packaging','Lien Zhou','Founder, Hikari Botanicals (Hong Kong)','We initiated a premium tea collection and required packaging that conveyed both artisanal quality and scalability. China Sourcing facilitated the development of bespoke magnetic boxes featuring foil stamping, which received highly favorable feedback from retailers and consumers alike.',1],
 ['packaging','David Greer','Operations Director, Voltware Inc. (USA)','From recyclable kraft boxes to PET blister packs for our electronic devices, each design adhered to specifications and was prepared for FDA/EU compliance. The sourcing procedure was executed flawlessly, characterized by meticulous attention to detail and punctual delivery.',2],
];

async function seedTestimonials(strapi, productMap) {
  for (const [pslug, authorName, authorRole, quote, order] of TESTIMONIALS) {
    await upsertByField(strapi, 'api::testimonial.testimonial', 'authorName', authorName, {
      authorName, authorRole, quote, order,
      product: productMap[pslug] ? { connect: [productMap[pslug]] } : undefined,
    });
  }
  console.log(`  • testimonial: ${TESTIMONIALS.length}`);
}

module.exports = { seedProducts, seedTestimonials, DEFAULT_USPS, usps };
