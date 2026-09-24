import React from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { Review } from '@/types';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <article className="review-card w-[85vw] max-w-[320px] md:min-w-[320px] flex-shrink-0">
      <div className="flex items-start gap-3">
        {review.avatar ? (
          <img
            src={review.avatar}
            alt={review.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
            {review.name.charAt(0)}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate">{review.name}</h4>
            {review.verified && (
              <span className="flex items-center gap-0.5 text-success text-xs whitespace-nowrap">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
          
          {/* Stars */}
          <div className="flex gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-3.5 h-3.5',
                  i < review.rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'
                )}
              />
            ))}
          </div>
        </div>
        
        <span className="text-xs text-muted-foreground whitespace-nowrap">{review.date}</span>
      </div>
      
      <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
        {review.comment}
      </p>
    </article>
  );
};

interface ReviewsSliderProps {
  reviews: Review[];
  title?: string;
}

export const ReviewsSlider: React.FC<ReviewsSliderProps> = ({ reviews, title }) => {
  return (
    <section className="py-8 md:py-12">
      {title && (
        <div className="px-4 md:px-0 mb-4 md:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4285F4] flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-semibold">{title}</h2>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">4.8</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-3.5 h-3.5',
                        i < 5 ? 'fill-accent text-accent' : 'text-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">(500+ reviews)</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-4 w-max pb-2">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};
