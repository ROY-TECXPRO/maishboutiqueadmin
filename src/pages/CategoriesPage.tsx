import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categories } from '@/data/products';
import { CategoryCard } from '@/components/category/CategoryCard';

const CategoriesPage: React.FC = () => {
  return (
    <div className="page-transition min-h-screen">
      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="mb-6 md:mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold">Shop by Category</h1>
          <p className="text-muted-foreground mt-1">Browse our complete collection</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <CategoryCard category={category} variant="default" />
            </motion.div>
          ))}
        </div>

        {/* Featured Categories */}
        <div className="mt-10 md:mt-16">
          <h2 className="font-display text-xl md:text-2xl font-semibold mb-4">Most Popular</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {categories.slice(0, 3).map((cat, i) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="relative rounded-2xl overflow-hidden aspect-video md:aspect-[4/3] group"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-xl font-bold text-white">{cat.name}</h3>
                  <p className="text-white/80 text-sm mt-1">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
