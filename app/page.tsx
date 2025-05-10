'use client';

import { useState, useEffect } from 'react';
import NewsCard from "./components/NewsCard";
import AdBanner from "./components/AdBanner";
import RefreshButton from "./components/RefreshButton";
import { NewsArticle, Ad } from "./types";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Virtual, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

// Import data service
import { getNewsArticles, getAds } from './lib/dataService';

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [combinedContent, setCombinedContent] = useState<Array<{ type: 'news' | 'ad', content: NewsArticle | Ad, index: number }>>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);

  // Load articles and ads from data service
  useEffect(() => {
    // Force clear any cached data to ensure we get fresh data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('flipnews_articles_cache');
      console.log('Cleared article cache on home page load');
    }

    // Get articles and ads from data service
    const fetchData = async () => {
      try {
        const [newsArticles, adsList] = await Promise.all([
          getNewsArticles(),
          getAds()
        ]);

        setArticles(newsArticles);
        setAds(adsList);

        // Create a combined array of content (news articles and ads)
        const adFrequency = 3; // Show ad after every 3 news articles
        const newCombinedContent: Array<{ type: 'news' | 'ad', content: NewsArticle | Ad, index: number }> = [];

        // Populate the combined content array
        newsArticles.forEach((article, index) => {
          // Add the news article
          newCombinedContent.push({
            type: 'news',
            content: article,
            index: newCombinedContent.length
          });

          // Add an ad after every 'adFrequency' articles
          if ((index + 1) % adFrequency === 0 && index < newsArticles.length - 1 && adsList.length > 0) {
            // Use different ads based on position
            const adIndex = Math.floor(index / adFrequency) % adsList.length;
            newCombinedContent.push({
              type: 'ad',
              content: adsList[adIndex],
              index: newCombinedContent.length
            });
          }
        });

        setCombinedContent(newCombinedContent);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Handle swiper slide change
  const handleSlideChange = (swiper: { activeIndex: number }) => {
    setCurrentIndex(swiper.activeIndex);

    // Hide instructions after first slide change
    if (showInstructions) {
      setShowInstructions(false);
    }
  };

  // Handle popup state change
  const handlePopupStateChange = (isOpen: boolean) => {
    setIsPopupOpen(isOpen);

    // Disable/enable swiping based on popup state
    if (swiperInstance) {
      if (isOpen) {
        // Disable swiping when popup is open
        swiperInstance.allowTouchMove = false;
        swiperInstance.mousewheel.disable();
      } else {
        // Enable swiping when popup is closed
        swiperInstance.allowTouchMove = true;
        swiperInstance.mousewheel.enable();
      }
    }
  };

  // Calculate the current position for display
  const getCurrentPosition = () => {
    const currentItem = combinedContent[currentIndex];
    if (currentItem?.type === 'news') {
      const newsIndex = articles.findIndex(article => article.id === (currentItem.content as NewsArticle).id);
      return `${newsIndex + 1} / ${articles.length}`;
    }
    return '';
  };

  // Function to refresh the content
  const refreshContent = async () => {
    // Force clear any cached data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('flipnews_articles_cache');
      console.log('Cache cleared via manual refresh');
    }

    try {
      // Get fresh articles and ads
      const [newsArticles, adsList] = await Promise.all([
        getNewsArticles(),
        getAds()
      ]);

      setArticles(newsArticles);
      setAds(adsList);

      // Recreate the combined content
      const adFrequency = 3; // Show ad after every 3 news articles
      const newCombinedContent: Array<{ type: 'news' | 'ad', content: NewsArticle | Ad, index: number }> = [];

      // Populate the combined content array
      newsArticles.forEach((article, index) => {
        // Add the news article
        newCombinedContent.push({
          type: 'news',
          content: article,
          index: newCombinedContent.length
        });

        // Add an ad after every 'adFrequency' articles
        if ((index + 1) % adFrequency === 0 && index < newsArticles.length - 1 && adsList.length > 0) {
          // Use different ads based on position
          const adIndex = Math.floor(index / adFrequency) % adsList.length;
          newCombinedContent.push({
            type: 'ad',
            content: adsList[adIndex],
            index: newCombinedContent.length
          });
        }
      });

      setCombinedContent(newCombinedContent);
    } catch (error) {
      console.error('Error refreshing content:', error);
    }
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
          onSwiper={(swiper) => setSwiperInstance(swiper)}
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
                  index={articles.findIndex(article => article.id === (item.content as NewsArticle).id) + 1}
                  totalArticles={articles.length}
                  onPopupStateChange={handlePopupStateChange}
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
        <div className="fixed top-4 right-4 z-20 flex items-center space-x-2">
          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {getCurrentPosition()}
          </div>
          <RefreshButton
            className="!py-1 !px-2 text-xs"
            label="Refresh"
            onRefresh={refreshContent}
          />
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
