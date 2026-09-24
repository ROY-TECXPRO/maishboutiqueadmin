-- ============================================
-- UPDATED ORDERS SCHEMA WITH USER AUTHENTICATION
-- 
-- If you get "policy already exists" errors, go to Supabase Dashboard:
-- 1. Go to Table Editor → orders
-- 2. Click on "Policies" tab
-- 3. Delete all existing policies
-- 4. Then run this SQL
-- ============================================

-- Step 1: Add user_id column to orders table
ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Step 2: Create index for user_id
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Step 3: Create RLS policies for orders
-- These policies allow users to only see their own orders

-- Allow anyone to insert orders
CREATE POLICY "Public Insert" ON orders
FOR INSERT WITH CHECK (true);

-- Users can view their own orders
CREATE POLICY "User View Own" ON orders
FOR SELECT USING (user_id = auth.uid());

-- Users can update their own orders
CREATE POLICY "User Update Own" ON orders
FOR UPDATE USING (user_id = auth.uid());

-- Step 4: Create RLS policies for order_items
-- Allow anyone to insert order items
CREATE POLICY "Public Insert Items" ON order_items
FOR INSERT WITH CHECK (true);

-- Users can view their own order items
CREATE POLICY "User View Own Items" ON order_items
FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
