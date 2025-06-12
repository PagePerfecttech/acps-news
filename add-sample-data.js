const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wtwetyalktzkimwtiwun.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0d2V0eWFsa3R6a2ltd3Rpd3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTgxNTksImV4cCI6MjA2NTI5NDE1OX0.44EU7VKJPO7W7Xpvf-X6zp58O0KuBYZ0seRTfLextR0'
);

async function addSampleData() {
  console.log('🚀 Adding sample data...');
  
  try {
    // Check if we have categories
    const { data: categories } = await supabase.from('categories').select('*');
    console.log('✅ Found', categories.length, 'categories');
    
    // Check if we have news articles
    const { data: articles } = await supabase.from('news_articles').select('*');
    console.log('📰 Found', articles.length, 'news articles');
    
    if (articles.length === 0) {
      console.log('📝 Adding sample news articles...');
      
      const sampleArticles = [
        {
          title: 'VIZAJ NEWS లాంచ్ - తెలుగు వార్తల కొత్త అనుభవం',
          content: 'VIZAJ NEWS అనేది తెలుగు వార్తల కోసం ప్రత్యేకంగా రూపొందించిన కొత్త వార్తా యాప్. ఈ యాప్ ద్వారా మీరు తాజా వార్తలను వేగంగా మరియు సులభంగా చదవగలరు. వర్టికల్ స్వైప్ ఫీచర్ తో మీరు వార్తల మధ్య సులభంగా నావిగేట్ చేయవచ్చు. ఈ యాప్లో సినిమా, రాజకీయాలు, క్రీడలు, వ్యాపారం, టెక్నాలజీ వంటి అన్ని రకాల వార్తలు లభిస్తాయి. అడ్మిన్ ప్యానెల్ ద్వారా కంటెంట్ మేనేజ్మెంట్ చాలా సులభం. బ్యాక్‌గ్రౌండ్ లోగో ఫీచర్ తో మీ బ్రాండింగ్ కూడా చేయవచ్చు.',
          summary: 'VIZAJ NEWS అనేది తెలుగు వార్తల కోసం ప్రత్యేకంగా రూపొందించిన కొత్త వార్తా యాప్.',
          category_id: categories.find(c => c.slug === 'technology')?.id,
          image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1470&auto=format&fit=crop',
          author: 'VIZAJ టీమ్',
          likes: 150,
          views: 1200
        },
        {
          title: 'తెలంగాణలో కొత్త IT పార్క్ ప్రకటన - వేలాది ఉద్యోగాలు',
          content: 'తెలంగాణ ప్రభుత్వం హైదరాబాద్‌లో కొత్త IT పార్క్ నిర్మాణాన్ని ప్రకటించింది. ఈ IT పార్క్ ద్వారా వేలాది మంది యువతకు ఉద్యోగ అవకాశాలు లభిస్తాయని ముఖ్యమంత్రి తెలిపారు. ఈ ప్రాజెక్ట్‌కు రూ. 5000 కోట్లు వ్యయం అవుతుందని, మూడు దశల్లో పూర్తి చేయనున్నట్లు అధికారులు వెల్లడించారు. ప్రపంచ ప్రఖ్యాత IT కంపెనీలు ఈ పార్క్‌లో తమ కార్యాలయాలు ఏర్పాటు చేసుకోవాలని అనుకుంటున్నాయి.',
          summary: 'తెలంగాణ ప్రభుత్వం హైదరాబాద్‌లో కొత్త IT పార్క్ నిర్మాణాన్ని ప్రకటించింది.',
          category_id: categories.find(c => c.slug === 'business')?.id,
          image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1470&auto=format&fit=crop',
          author: 'రాజేష్ కుమార్',
          likes: 89,
          views: 756
        },
        {
          title: 'RRR సినిమాకు మరో అంతర్జాతీయ అవార్డు',
          content: 'రాజమౌళి దర్శకత్వంలో తెరకెక్కిన RRR సినిమాకు మరో అంతర్జాతీయ అవార్డు లభించింది. ఈ సినిమా ఇప్పటికే ఆస్కార్ అవార్డు గెలుచుకుని భారత సినిమా చరిత్రలో మైలురాయిగా నిలిచింది. తాజాగా లండన్‌లో జరిగిన ఫిల్మ్ ఫెస్టివల్‌లో ఈ సినిమాకు బెస్ట్ ఇంటర్నేషనల్ ఫిల్మ్ అవార్డు లభించింది. రామ్ చరణ్, జూనియర్ ఎన్టీఆర్ నటించిన ఈ సినిమా ప్రపంచవ్యాప్తంగా మంచి ఆదరణ పొందింది.',
          summary: 'రాజమౌళి దర్శకత్వంలో తెరకెక్కిన RRR సినిమాకు మరో అంతర్జాతీయ అవార్డు లభించింది.',
          category_id: categories.find(c => c.slug === 'cinema')?.id,
          image_url: 'https://images.unsplash.com/photo-1489599904472-84978f312f2e?q=80&w=1470&auto=format&fit=crop',
          author: 'సినిమా రిపోర్టర్',
          likes: 234,
          views: 1890
        }
      ];
      
      for (const article of sampleArticles) {
        const { error } = await supabase.from('news_articles').insert(article);
        if (error) {
          console.log('❌ Error adding article:', error.message);
        } else {
          console.log('✅ Added article:', article.title.substring(0, 30) + '...');
        }
      }
    }
    
    // Check settings
    const { data: settings } = await supabase.from('site_settings').select('*');
    console.log('⚙️  Found', settings.length, 'settings');
    
    console.log('🎉 Sample data setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addSampleData();
