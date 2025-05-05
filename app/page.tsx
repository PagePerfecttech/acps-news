'use client';

import { useState } from 'react';
import NewsCard from "./components/NewsCard";
import AdBanner from "./components/AdBanner";
import { NewsArticle, Ad } from "./types";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Virtual, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

// Import longer news posts
import { longNewsPosts } from './data/longNewsPosts';

// Use the longer news posts
const mockArticles: NewsArticle[] = longNewsPosts;

const mockAds: Ad[] = [
  {
    id: '1',
    title: 'ప్రీమియం సబ్‌స్క్రిప్షన్ - అన్లిమిటెడ్ యాక్సెస్ పొందండి',
    description: 'ఇప్పుడే సబ్‌స్క్రైబ్ చేసుకొని యాడ్-ఫ్రీ రీడింగ్, ఎక్స్‌క్లూజివ్ కంటెంట్ మరియు మరిన్ని ఆనందించండి!',
    image_url: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=1470&auto=format&fit=crop',
    link_url: '/subscribe',
    frequency: 3, // Show after every 3 articles
    active: true,
    created_at: '2023-05-01T00:00:00Z',
    updated_at: '2023-05-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'నూతన స్మార్ట్‌ఫోన్ లాంచ్',
    description: 'అత్యాధునిక ఫీచర్లతో కొత్త స్మార్ట్‌ఫోన్ మార్కెట్లోకి',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    video_type: 'youtube',
    link_url: '/smartphone',
    frequency: 5,
    active: true,
    created_at: '2023-05-02T00:00:00Z',
    updated_at: '2023-05-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'ఆన్‌లైన్ షాపింగ్ ఆఫర్స్',
    text_content: 'ఇప్పుడే కొనుగోలు చేసి 50% వరకు పొదుపు చేయండి!',
    image_url: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1470&auto=format&fit=crop',
    link_url: '/shopping',
    frequency: 4,
    active: true,
    created_at: '2023-05-03T00:00:00Z',
    updated_at: '2023-05-03T00:00:00Z',
  }
];

// Ads will be used in the combined content array

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  // Create a combined array of content (news articles and ads)
  const adFrequency = 3; // Show ad after every 3 news articles
  const combinedContent: Array<{ type: 'news' | 'ad', content: NewsArticle | Ad, index: number }> = [];

  // Populate the combined content array
  mockArticles.forEach((article, index) => {
    // Add the news article
    combinedContent.push({
      type: 'news',
      content: article,
      index: combinedContent.length
    });

    // Add an ad after every 'adFrequency' articles
    if ((index + 1) % adFrequency === 0 && index < mockArticles.length - 1) {
      // Use different ads based on position
      const adIndex = Math.floor(index / adFrequency) % mockAds.length;
      combinedContent.push({
        type: 'ad',
        content: mockAds[adIndex],
        index: combinedContent.length
      });
    }
  });

  // Handle swiper slide change
  const handleSlideChange = (swiper: { activeIndex: number }) => {
    setCurrentIndex(swiper.activeIndex);

    // Hide instructions after first slide change
    if (showInstructions) {
      setShowInstructions(false);
    }
  };

  // Calculate the current position for display
  const getCurrentPosition = () => {
    const currentItem = combinedContent[currentIndex];
    if (currentItem.type === 'news') {
      const newsIndex = mockArticles.findIndex(article => article.id === (currentItem.content as NewsArticle).id);
      return `${newsIndex + 1} / ${mockArticles.length}`;
    }
    return '';
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-100">
      {/* Full Screen News Feed with Vertical Swipe */}
      <div className="w-full h-full">
        <Swiper
          direction="vertical"
          mousewheel={true}
          modules={[Virtual, Mousewheel, EffectCards]}
          className="h-full w-full"
          initialSlide={currentIndex}
          onSlideChange={handleSlideChange}
          effect="cards"
          cardsEffect={{
            slideShadows: false,
            perSlideRotate: 2,
            perSlideOffset: 8,
          }}
          virtual
        >
          {combinedContent.map((item, index) => (
            <SwiperSlide key={`${item.type}-${item.index}`} virtualIndex={index}>
              {item.type === 'news' ? (
                <NewsCard
                  article={item.content as NewsArticle}
                  index={mockArticles.findIndex(article => article.id === (item.content as NewsArticle).id) + 1}
                  totalArticles={mockArticles.length}
                />
              ) : (
                <div className="w-full h-full">
                  <AdBanner ad={item.content as Ad} fullScreen={true} />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Position indicator */}
        <div className="fixed top-4 right-4 z-20">
          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {getCurrentPosition()}
          </div>
        </div>

        {/* Swipe instruction overlay - only shown initially */}
        {showInstructions && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-30">
            <div className="text-center text-white bg-black bg-opacity-70 px-6 py-3 rounded-xl">
              <p className="mb-2 font-bold">Swipe to Navigate</p>
              <p>Swipe Up ↑ for Next • Swipe Down ↓ for Previous</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
