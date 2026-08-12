'use strict';
const { blocks, tag, btn, upsertBySlug, upsertByField } = require('./seed-lib');

// ---------- 4 SERVICE ----------
const step = (label, title, description) => ({ label, title, description });
const faq = (arr) => arr.map(([question, ...paras]) => ({ question, answer: blocks(...paras) }));
const items = (arr) => arr.map(([title, description]) => ({ title, description }));

const SERVICES = [
 { order:1, title:'Sourcing Service', slug:'sourcing-service',
   cardDescription:'Factory selection done right with vetted suppliers, verified capabilities, and no middle layer',
   heroHeading:'Smarter Sourcing Starts with the Right Factory',
   heroDescription:'Our expertise spans various sourcing categories, ensuring a tailored approach to meet your unique requirements.',
   offerings:{ tag:tag('Our Offerings'), heading:'What We Offer',
     description:'Situated strategically in close proximity to Asia’s major manufacturing hubs and bustling markets, our on-the-ground team is positioned to seamlessly connect you with the precise products you need.',
     items: items([
       ['Factory Sourcing','Factory identification and shortlisting (not marketplace scraping)'],
       ['Supplier Audits','Supplier audits: capability, certificates, past clients'],
       ['Negotiation Support','MOQ, price, and lead time negotiation'],
       ['Sample Management','Sample coordination and quality checks'],
       ['Transparent Pricing','Transparent quotations and timelines'],
     ])},
   process:{ tag:tag('Our Process'), heading:'How We Source', steps:[
     step('Step 1','Enquire','Speak to our team to align on your requirement and build out your product brief.'),
     step('Step 2','Quoting Stage','Once we have negotiated your requirements with our preferred manufacturers, we will promptly submit our price proposal to you.'),
     step('Step 3','Sample & Design','Sample and design confirmation are integral elements that instill confidence in the product you will receive. By thoroughly reviewing and validating samples and designs, we ensure that the final product meets your expectations.'),
     step('Step 4','Confirmation','Order confirmation is finalized upon receipt of your deposit payment.'),
     step('Step 5','Production','Production commences on the goods and the agreed-upon production timeline (roughly around 3-6 weeks) which is closely monitored by our on-the-ground team.'),
     step('Step 6','Quality Assurances','Our team is on hand to offer various quality assurance methods: audits of pre-production/raw materials, during production inspections, post-production inspections, and pre-loading inspections.'),
     step('Step 7','Final inspection and balance','Upon the completion of production, our team will conduct a thorough quality inspection to ensure the goods meet the highest standards before the balance is paid.'),
     step('Step 8','Freight and Logistics','Once the final payment is received, we organize freight and delivery from our warehouse to your specified address.'),
   ]},
   usp:{ tag:tag('Our USPs'), heading:'Why Choose Us for Sourcing', items: items([
     ['Work With Local Experts','Manage all parts of the supply chain to ensure you are truly happy with the results.'],
     ['Remove Language Barriers','Communicate effortlessly with our fluent, English-speaking local team.'],
     ['Simplify Communication','Coordinate all moving parts of the supply chain through a single point of contact for faster, smoother execution.'],
     ['Reduce Sourcing Costs','Leverage our trusted supplier network to secure more competitive pricing.'],
     ['Use Trusted Factories','Work with vetted factories we’ve already tested and approved.'],
     ['Ensure Product Quality','Conduct inspections at every stage to guarantee consistent, high-quality products.'],
   ])},
   faqItems: faq([
     ['What are your lead times?','Our standard production lead time is 21 – 27 days for custom manufactured products.','Having said that, the actual lead times can differ based on the specific product or products you need. Before providing a quote, we engage in negotiations with the factory on your behalf. This ensures that you have a clear understanding and are satisfied with the production lead time before making any commitments to your order.'],
     ['What are your fees and charges?','The quoted price we provide you is all-encompassing, covering our fees within the package.','In an industry renowned for its competitiveness, our customers are familiar with prevailing market rates. Recognizing these benchmarks enables our customers to appreciate the cost-effectiveness of our services and understand our on-the-ground team’s ability to negotiate with our already established networks.'],
     ['Why use a sourcing company?','Benefit from our extensive relationships with markets and factories, ensuring that you receive superior prices and services beyond what a first-time buyer might expect.','Your dedicated account manager serves as your singular point of contact throughout the entire supply chain. Backed by our comprehensive team, including price negotiators, designers, quality assurance, and freight experts, your dedicated point of contact has the full support needed to optimize your experience from start to finish.'],
     ['Can you produce custom products which are not on the market?','Certainly, if you have a design or an idea in mind our team will help turn that idea into reality.','From the initial stages of molding and tooling to the intricacies of research and development (R&D), our team is committed to guiding you through the entire process. We’ll work closely to produce a prototype for your approval, ensuring that every detail meets your expectations. Once the sample receives your green light, we replicate the same level of quality and precision in the final production, delivering a product that aligns seamlessly with your vision.'],
     ['What criteria do you use to select suppliers & manufacturers?','When faced with a demand for a product from a factory not yet in our network, our seasoned team excels in selecting the best options using a comprehensive set of key metrics.','These metrics encompass various crucial aspects, including location, industry experience, financial background audit, certification, track record with previous and current customers, customer service standards, quality checks, factory inspections, and pricing structures. By meticulously evaluating these key metrics, we can pinpoint the most suitable options and offer our customers our suggested/preferred manufacturer.'],
     ['How do you handle product defects?','Our team carry out quality control measures at all stages throughout the supply chain, these include pre-production inspections, during production inspections, end of production inspections, prior to loading inspections. We find that if there is a problem (which in some product cases is very likely) that our team is on the ground and able to identify these quality problems before they become an issue for our customers.'],
   ]),
   otherServicesSubtitle:'Need more than just Sourcing?' },
 { order:2, title:'Custom Manufacturing', slug:'custom-manufacturing',
   cardDescription:'Turn product ideas into production ready files and samples, even if you are starting from scratch.',
   heroHeading:'Custom Manufacturing',
   heroDescription:'We help businesses bring their product ideas to life through our trusted network of experienced manufacturers efficiently and seamlessly.',
   offerings:{ tag:tag('Our Offerings'), heading:'What We Offer', items: items([
     ['OEM/ODM Development',''],['Prototype Coordination',''],['Factory Selection',''],['Full Production Management',''],
   ])},
   process:{ tag:tag('Our Process'), heading:'How We Custom Manufacturing', steps:[
     step('Step 1','Conceptualization and Design',''), step('Step 2','Product Design and Engineering',''),
     step('Step 3','Material Selection and Sourcing',''), step('Step 4','Manufacturing Planning',''),
     step('Step 5','Manufacturing and Production',''), step('Step 6','Assembly and Integration',''),
     step('Step 7','Packaging Design and Branding',''), step('Step 8','Testing and Certification',''),
   ]},
   usp:{ tag:tag('Our USPs'), heading:'Why Choose Us for Custom Manufacturing', items: items([
     ['Expertise in Design & Development',''],['Local & Global Support',''],['No MOQ Limitations',''],
     ['Full Transparency',''],['Factory Flexibility',''],
   ])},
   faqItems: [], otherServicesSubtitle:'Need more than just Custom Manufacturing?' },
 { order:3, title:'Quality Control', slug:'quality-control',
   cardDescription:'Documents the processes carefully and provides detailed reports to customers through real photos and video.',
   heroHeading:'Quality Control',
   heroDescription:'We enforce a comprehensive set of quality control measures to make sure your product meets the highest standards across the entire supply chain.',
   offerings:{ tag:tag('Our Offerings'), heading:'What We Offer', items: items([
     ['Inline Quality Checks',''],['Pre-shipment Inspections',''],['Supplier Audits',''],['Factory Visits & Reporting',''],
   ])},
   process:{ tag:tag('Our Process'), heading:'How We Quality Control', steps:[
     step('Step 1','Factory audit',''), step('Step 2','Pre production inspection (PPI)',''),
     step('Step 3','During production inspection (DUPRO)',''), step('Step 4','Pre shipment inspection (PSI)',''),
     step('Step 5','Container loading check (CLC)',''),
   ]},
   usp:{ tag:tag('Our USPs'), heading:'Why Choose Us for Quality Control', items: items([
     ['On-The-Ground Presence',''],['Real-Time Reporting',''],['No Surprises',''],['Expert Inspectors',''],['Customized Inspections',''],
   ])},
   faqItems: [], otherServicesSubtitle:'Need more than just Quality Control?' },
 { order:4, title:'Freight & Logistics', slug:'freight-logistics',
   cardDescription:'Our dedicated team manage the entire process and endless paperwork to getting our goods to do your.',
   heroHeading:'Freight & Logistics',
   heroDescription:'Our team manage the entire process and endless paperwork to getting our goods to do your.',
   offerings:{ tag:tag('Our Offerings'), heading:'What We Offer', items: items([
     ['International Freight Forwarding',''],['Customs Clearance & Documentation',''],['Warehousing & Distribution',''],
     ['Insurance & Risk Management',''],['Supply Chain Optimization',''],
   ])},
   process:{ tag:tag('Our Process'), heading:'How We Freight & Logistics', steps:[
     step('Option 1','Air freight','Air freight is chosen by customers when speed is paramount. While it is the most expensive option, it offers the advantage of delivering goods to your door in approximately one week. This rapid transportation method is favored for time-sensitive shipments where the benefits of swift delivery outweigh the higher cost.'),
     step('Option 2','Sea freight','Sea freight is the preferred choice for customers due to its popularity and the availability of various cost-reducing options. This shipping method, while generally more time-consuming, offers flexibility and cost-effectiveness, making it a favored option for businesses seeking economical transportation solutions.'),
     step('Option 3','Road freight','When possible, road freight proves to be a reliable and flexible option. However, due to geographical constraints and road connectivity, it is often integrated with other modes of transport to establish a comprehensive and efficient supply chain.'),
     step('Option 4','Rail freight','Rail freight excels in efficiently transporting heavy and bulky cargo across long distances. Its cost-effectiveness is notable, provided there is robust infrastructure in place. The low carbon footprint of rail freight positions it as an environmentally friendly option, suggesting a growing trend of increased utilization across borders and oceans in the future.'),
   ]},
   usp:{ tag:tag('Our USPs'), heading:'Why Choose Us for Freight & Logistics', items: items([
     ['Global Network',''],['Real-Time Tracking',''],['No Hidden Fees',''],['Custom Solutions',''],['On-Time Delivery',''],
   ])},
   faqItems: [], otherServicesSubtitle:'Need more than just Freight & Logistics?' },
];

async function seedServices(strapi) {
  const map = {};
  for (const s of SERVICES) {
    map[s.slug] = await upsertBySlug(strapi, 'api::service.service', s.slug, {
      ...s, heroButton: btn('Get a Free Quote', '/contact-us/'),
    });
  }
  console.log(`  • service: ${SERVICES.length}`);
  return map;
}

// ---------- 14 CASE STUDY ----------
const CASE_STUDIES = [
 ['Prestige Residential','prestige-residential','Sourcing Service','Ben and his team at Prestige Residential manage a portfolio of high-end apartment buildings across Queensland and Australia, providing quality living experiences for their residents and guests.',true,'Australia','Hospitality Items'],
 ['Pillers','pillers','Freight & Logistics','Pillers Freight, led by Phil, is an import-focused business sourcing a variety of products from multiple suppliers across Asia. As the company grew, Phil needed a smarter logistics approach to manage incoming goods efficiently and reduce freight-related costs.',false,null,null],
 ['ByronGlow','byronglow','Custom Manufacturing',"ByronGlow is a modern health and beauty brand inspired by the wellness lifestyle of Australia’s Byron Bay. The brand offers high-quality, self-care products, including red light therapy units and wellness accessories, designed to help people look and feel their best naturally.",false,null,null],
 ['Echo Recovery','echo-recovery','Custom Manufacturing','Echo Recovery, founded by Brodie, is a wellness brand focused on physical and mental recovery through cold water therapy. Their flagship product - a premium, portable ice bath - is designed to help athletes, high-performers, and wellness enthusiasts recover faster, reduce inflammation, and build resilience.',false,null,null],
 ['Radiant','radiant','Custom Manufacturing','Radiant is a purpose-built shower nozzle designed in-house to reduce harmful toxins commonly found in water. By filtering out these impurities, Radiant helps customers achieve fresher, healthier hair.',false,null,null],
 ['BOXED Storage','boxed-storage','Custom Manufacturing','BOXED Storage is an Australian company offering smart, secure storage solutions designed to fit above car bonnets in apartment and residential parking spaces. Their innovative products help apartment dwellers maximise storage space without sacrificing convenience or security.',false,null,null],
 ['Langfords Jewellers','langfords-jewellers','Custom Manufacturing','Langfords Jewellers is a well-established jewellery retailer known for offering high-quality, timeless pieces to customers across Australia. With a focus on craftsmanship, heritage, and exceptional customer service, Langfords has built a trusted name in the jewellery space.',false,null,null],
 ['TAG Apparel','tag-apparel','Custom Manufacturing','TAG Apparel is a performance-driven running apparel brand focused on creating high-quality, comfortable, and durable gear for athletes and active lifestyles. Built by runners for runners, their products are designed to withstand tough conditions while delivering style and function.',true,'Vietnam','Gym & Fitness'],
 ['Muscle Mat','muscle-mat','Custom Manufacturing','Muscle Mat is a growing online brand that specialises in comfort-focused home products including pillows, mattress toppers, rugs, and wellness accessories. With a strong emphasis on quality and customer satisfaction, they’ve built a loyal following in the e-commerce space.',true,'Australia','Bedding & Home'],
 ['The Cabinet Hub','the-cabinet-hub','Custom Manufacturing','The Cabinet Hub is a premium cabinetry supplier catering to luxury residential and commercial developments across Australia. Known for their attention to detail and bespoke joinery solutions, they service builders, designers, and developers who demand exceptional quality and reliability.',false,null,null],
 ['AFIS','afis','Sourcing Service','AFIS supplies food manufacturers across Australia with a wide range of high-quality food ingredients sourced from around the world. Their customers rely on them for consistency, safety, and competitive pricing in an industry where standards and reliability are non-negotiable.',false,null,null],
 ['Stockyard','stockyard','Sourcing Service','Stockyard is a premium Australian beef producer known for delivering world-class Wagyu and Angus beef to customers across the globe. With a strong focus on quality, innovation, and brand integrity, they’ve built a reputation as one of Australia’s most respected beef brands.',false,null,null],
 ['TH7','th7','Sourcing Service','TH7 is a premium health and wellness brand offering services such as ice baths, infrared saunas, steam rooms, and red light therapy. With a growing presence in Australia, their facilities are designed to enhance physical recovery, mental clarity, and overall well-being for a broad community of health-conscious members.',false,null,null],
 ['Funny Aprons','funny-aprons','Custom Manufacturing','Funny Aprons is an eCommerce brand that specialises in quirky, high-quality aprons featuring humorous slogans and creative designs. Known for their playful tone and viral appeal, the brand has grown quickly by targeting gift-givers and customers looking for novelty kitchenwear that stands out.',false,null,null],
];

const CS_DETAIL = {
 'tag-apparel': {
   whatWeDoDescription:'We partnered with TAG Apparel to meet the technical demands of activewear, from fabric performance to fit and finish so they could scale collections with confidence and stay focused on building their community.',
   highlights: items([
     ['Matched them with the right performance factories','We sourced specialized suppliers experienced in moisture-wicking, athletic-grade materials, and tight lead times.'],
     ['Aligned every detail to brand standards',"Working closely with TAG's design team, we ensured construction, print, and packaging delivered both quality and flexibility."],
     ['Took over production coordination','We handled everything from factory communication to QC and logistics - freeing up their team to focus on growth.'],
     ['Enabled faster, confident collection launches','With a scalable sourcing process in place, TAG has successfully released new product lines while keeping pace with demand.'],
   ]),
   challengeTag: tag('What we faced'),
   challengeContent: blocks('TAG Apparel needed a sourcing partner who could understand the technical demands of performance wear – from moisture-wicking fabrics and stitching strength to custom fits and fast turnarounds.'),
   solutionTag: tag('Our Solution'),
   solutionContent: blocks(
     "China Sourcing partnered with TAG Apparel to identify specialized garment factories with activewear expertise, managing factory communication, quality assurance, and logistics. This allowed TAG's team to concentrate on brand development while maintaining scalable production.",
     'Results',
     'TAG Apparel now has a streamlined and scalable production process in place, with the capability to launch multiple collections confidently.'),
 },
 'prestige-residential': {
   whatWeDoDescription:'We helped Prestige Residential streamline their entire sourcing process from towels to poolside furniture so they can focus on growing their property portfolio, not managing suppliers.',
   highlights: items([
     ['Replaced multiple vendors with one contact','Ben and his team no longer juggle fragmented supplier lists. We became their single point of contact across all categories.'],
     ['Handled all communication & coordination','From price negotiation to delivery timelines, our team managed every detail with vendors - saving Prestige countless hours.'],
     ['Delivered consistency at scale','Whether sourcing daily consumables or custom-built furniture, we ensured on-time delivery and reliable product quality.'],
     ['Enabled focus on core operations','With a smoother sourcing system in place, Ben and his team now concentrate on what they do best: managing and expanding high-end properties across Australia.'],
   ]),
   challengeTag: tag('What we faced'),
   challengeContent: blocks('As property managers, the team at Prestige Residential are constantly procuring a diverse range of products – from linens and towels to poolside and beach furniture. Managing multiple suppliers for different needs had become time-consuming, inefficient, and difficult to scale.'),
   solutionTag: tag('Our Result'),
   solutionContent: blocks(
     'By partnering with China Sourcing Co, Prestige Residential now has a single point of contact for all their sourcing needs. Rather than managing a long list of vendors, they work directly with our team who handle all communication, negotiation, and coordination with suppliers.',
     "Prestige Residential now enjoys a simplified, reliable sourcing process. Whether it's custom furniture or day-to-day consumables, our team ensures smooth delivery and consistent quality, allowing Ben and his team to focus on what they do best: managing and growing their properties."),
 },
 'muscle-mat': {
   whatWeDoDescription:'We helped Muscle Mat simplify and scale their sourcing, handling everything from sampling and supplier vetting to quality checks so they can focus on growing their e-commerce brand.',
   highlights: items([
     ['Brought all sourcing under one roof','As Muscle Mat expanded product lines, we centralized their supplier management—reducing time spent juggling multiple vendors.'],
     ['Ensured consistent quality across categories','From pillows to wellness accessories, we helped them maintain high standards and compliance across every product.'],
     ['Streamlined production and logistics','We managed timelines, sampling, and quality control so Muscle Mat could launch products faster with less friction.'],
     ['Enabled confident business growth','With sourcing handled end-to-end, Muscle Mat now scales efficiently without getting bogged down in complexity.'],
   ]),
   challengeTag: tag('What we faced'),
   challengeContent: blocks('As their product range expanded, sourcing reliable manufacturers for diverse product lines while maintaining quality, consistency, and competitive pricing became increasingly difficult. Managing multiple suppliers across different product categories took time and energy away from marketing and business growth.'),
   solutionTag: tag('Our Solution'),
   solutionContent: blocks(
     'China Sourcing Co stepped in to become their end-to-end sourcing partner. By consolidating their supplier management under one roof, we helped Muscle Mat source high-quality products across multiple categories, ensure compliance with international quality standards, and manage production timelines.',
     'Muscle Mat now has a streamlined sourcing operation with a trusted partner handling everything from factory selection and sampling to quality control and logistics. This has enabled them to confidently expand their product offering and scale their business without being bogged down by the complexities of international sourcing.'),
 },
};

async function seedCaseStudies(strapi) {
  const map = {};
  for (const [title, slug, service, description, featured, region, industry] of CASE_STUDIES) {
    map[slug] = await upsertBySlug(strapi, 'api::case-study.case-study', slug, {
      title, slug, service, description, featured,
      region: region || undefined, industry: industry || undefined,
      ...(CS_DETAIL[slug] || {}),
    });
  }
  console.log(`  • case-study: ${CASE_STUDIES.length}`);
  return map;
}

// ---------- CATEGORY + 12 RESOURCE ----------
const CATEGORIES = ['Logistics Tips','Basic Blog Functions','Canton Fair','Ecommerce','Freight & Logistics','Manufacturing','Market insights','Product Guide','Sourcing Guide','Wholesale Furniture'];
const slugify = (s) => s.toLowerCase().replace(/&/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const RESOURCES = [
 ['The Hidden Profit Leak Most Ecommerce Brands Ignore','the-hidden-profit-leak-most-ecommerce-brands-ignore','Other',null,'A data-backed sourcing guide showing how “cheap” manufacturing decisions can lead to higher returns and lower margins.'],
 ['Incoterms Explained','incoterms-explained','Other','Logistics Tips','FOB, EXW, CIF? Cut through the jargon with this one-page Incoterms guide for importers.'],
 ['Supplier Interview Questions List','supplier-interview-questions-list','Other','Logistics Tips','Use our curated list of questions to ask during factory calls or visits to assess reliability and fit.'],
 ['8 Biggest Mistakes to Avoid When Sourcing from China','8-biggest-mistakes-to-avoid-when-sourcing-from-china','Other','Logistics Tips','Download this short guide to avoid common sourcing pitfalls.'],
 ['China Supplier Outreach Email Scripts','china-supplier-outreach-email-scripts','Template','Logistics Tips','Copy and paste email templates to professionally introduce your business and request quotes from Chinese suppliers.'],
 ['Custom Manufacturing Requirements Template','custom-manufacturing-requirements-template','Template','Logistics Tips','Clearly communicate your requirements when developing new or custom products with Chinese factories.'],
 ['Quality Control Inspection Checklist','quality-control-inspection-checklist','Checklist','Logistics Tips','A downloadable example of a QC checklist used in factory inspections and customize for your own products.'],
 ['Intro to China Manufacturing','intro-to-china-manufacturing','eBook','Logistics Tips','A beginner’s guide to sourcing from China, from finding suppliers to understanding MOQs and IP protection.'],
 ['Pre-Production Sample Checklist','pre-production-sample-checklist','Checklist','Logistics Tips','The must-have checklist before approving your golden sample – avoid costly mistakes and miscommunication.'],
 ['Sourcing Timeline Template','sourcing-timeline-template','Template','Logistics Tips','Understand the key stages in a China sourcing project, from RFQ to delivery and how long each step typically takes.'],
 ['Manufacturer Vetting Checklist','manufacturer-vetting-checklist','Checklist','Logistics Tips','Our internal checklist of the top 10 criteria we use to identify the right factory partners in China.'],
 ['RFQ Template','rfq-template','Template','Logistics Tips','Use our proven RFQ template to communicate clearly with suppliers and get accurate quotes faster.'],
];

async function seedResources(strapi) {
  const catMap = {};
  for (const name of CATEGORIES) {
    catMap[name] = await upsertBySlug(strapi, 'api::category.category', slugify(name), { name, slug: slugify(name) });
  }
  console.log(`  • category: ${CATEGORIES.length}`);
  for (const [title, slug, resourceType, cat, desc] of RESOURCES) {
    await upsertBySlug(strapi, 'api::resource.resource', slug, {
      title, slug, resourceType, gated: false, gateAfterBlocks: 3,
      content: blocks(desc),
      categories: cat ? { connect: [catMap[cat]] } : undefined,
    });
  }
  console.log(`  • resource: ${RESOURCES.length}`);
  return catMap;
}

// ---------- TEAM MEMBER + PARTNER CATEGORY ----------
const TEAM = [
 ['Sam Sheehan','Co Founder','Leverages his entrepreneurial background from founding product businesses to benefit clients. His firsthand exploration of Asia\'s manufacturing landscape provides deep supply chain understanding. Based in Brisbane.','Australia'],
 ['Tom Daniels','Co Founder','Leads Asia-based operations from China and Vietnam. His passion for Asian cultures, combined with commitment to quality and operational excellence, ensures rigorous supply chain management.','China'],
 ['Lee Abrahams','Business Development Manager','Based in Sydney, drives development across Australia and the United States. Acts as key liaison between regional teams, known for approachable, customer-focused style prioritizing direct communication.','Australia'],
 ['Janice Xu','Senior Sourcing','Uses excellent communication and customer focus to help clients succeed. With outgoing personality and positive attitude, builds strong relationships with customers and suppliers.','China'],
 ['Miguel Misa','Business Development','Deep understanding of customer needs and tailored sourcing solutions. Strong focus on relationship-building, takes time to understand each client\'s unique challenges.','China'],
 ['Kady Hoang','Vietnam Manager','Exceptional Office Manager in Vietnam, navigates intricacies of business in dynamic environment, ensures smooth functioning of operations.','Vietnam'],
 ['Germaine Huang','Senior Sourcing','Highly experienced with strong background in global supply chains and supplier negotiation. Deep industry knowledge ensures customers receive best possible value.','China'],
 ['Jessie Yi','Quality Control Manager','Uses sharp attention to detail and commitment to excellence ensuring every product meets highest standards. Deep understanding of manufacturing processes and QA protocols.','China'],
 ['Nga Van','Accountant','Meticulous and efficient approach to financial management. Developed streamlined systems for customer payments and workflows ensuring smooth, transparent processes.','Vietnam'],
 ['Quang Ho','Marketing Manager','Leads all marketing efforts with strategic approach and exceptional management skills. Aligns brand objectives with customer needs, emphasizing cost-efficiency and quality output.','Vietnam'],
 ['Bheki Mhlanga','General Manager','Deep expertise from years living and working in China. Hands-on knowledge of supply chains, factory operations, and business culture invaluable for supplier management.','China'],
 ['Jennifer Zhuang','Senior Sourcing','Known for speed, precision, and customer-first mindset. Delivers critical information quickly and accurately, enabling clients to move forward with confidence.','China'],
 ['Thao Ngo','Senior Sourcing (Vietnam Office)','Helps customers diversify supply chains with confidence. Connects clients with Vietnam\'s best manufacturers for consistent, high-quality production.','Vietnam'],
 ['Trang Hoang','Visual Designer','Specializes in visual storytelling through clean, intentional design. Work spans branding, social content, and UI assets with consistent, modern aesthetic.','Vietnam'],
 ['Tuan Nguyen','SEO & Web Specialist','Focuses on building websites that rank, load fast, and perform well. Ensures every project meets search and user experience standards with problem-solving mindset.','Vietnam'],
 ['Long Nguyen','Content & Growth Specialist','Creates high-impact content using keyword research and audience insights. Builds organic growth systems across platforms, crafting pieces to resonate and convert.','Vietnam'],
];
const PARTNER_CATEGORIES = ['Furniture & Interior','Promotional Products','Gym & Fitness','Point of Sale','Machinery','Hospitality Items','Household Appliances'];

async function seedMisc(strapi) {
  const team = [];
  for (let i = 0; i < TEAM.length; i++) {
    const [name, jobTitle, bio, location] = TEAM[i];
    team.push(await upsertByField(strapi, 'api::team-member.team-member', 'name', name, {
      name, jobTitle, bio, location, order: i + 1, featuredOnAboutUs: true }));
  }
  console.log(`  • team-member: ${TEAM.length}`);
  for (let i = 0; i < PARTNER_CATEGORIES.length; i++) {
    const name = PARTNER_CATEGORIES[i];
    await upsertBySlug(strapi, 'api::partner-category.partner-category', slugify(name), { name, slug: slugify(name), order: i + 1 });
  }
  console.log(`  • partner-category: ${PARTNER_CATEGORIES.length}`);
  return team;
}

module.exports = { seedServices, seedCaseStudies, seedResources, seedMisc, items, faq, step };
