import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, Heart, MessageCircle, ShoppingCart, Plus, Minus } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'coffee' | 'non-coffee' | 'food' | 'sri-lankan-coffee' | 'sri-lankan-non-coffee' | 'sri-lankan-food';
  description?: string;
  isHot?: boolean;
}

const menuItems: MenuItem[] = [
  // Regular Coffee
  { id: '1', name: 'Americano', price: 3.50, category: 'coffee', description: 'A simple, classic choice made by diluting espresso with hot water. It\'s a great option for those who enjoy the flavor of coffee without milk.', isHot: true },
  { id: '2', name: 'Cappuccino', price: 2.50, category: 'coffee', description: 'This is a balanced drink with equal parts espresso, steamed milk, and a thick layer of frothed milk on top. It\'s known for its light, airy texture.', isHot: true },
  { id: '3', name: 'Caffè Latte', price: 4.00, category: 'coffee', description: 'A milky and smooth drink, a latte is mostly steamed milk with a shot of espresso and a thin layer of foam. Perfect for those who prefer a less intense coffee flavor.', isHot: true },
  { id: '4', name: 'Frappuccino', price: 5.00, category: 'coffee', description: 'A blended iced coffee drink. It\'s a sweet, creamy, and refreshing treat that often includes flavored syrups, topped with whipped cream.', isHot: false },
  { id: '5', name: 'Macchiato', price: 3.80, category: 'coffee', description: 'An espresso "marked" with a small amount of steamed milk foam. This is a strong and bold drink for coffee purists who want just a hint of sweetness and texture.', isHot: true },
  { id: '6', name: 'Espresso', price: 3.50, category: 'coffee', description: 'A concentrated shot of coffee. It\'s the base for most of the other coffee drinks and is served in a small cup. A powerful and pure coffee experience.', isHot: true },
  { id: '7', name: 'Caramel Latte', price: 4.50, category: 'coffee', description: 'A sweet twist on the classic latte, featuring rich caramel syrup mixed with espresso and steamed milk. A delicious and popular treat.', isHot: true },
  { id: '8', name: 'Affogato Coffee', price: 3.70, category: 'coffee', description: 'A decadent Italian dessert and coffee hybrid. It consists of a scoop of vanilla ice cream drowned in a shot of hot espresso.', isHot: true },

  // Non-Coffee
  { id: '9', name: 'Chamomile', price: 3.00, category: 'non-coffee', description: 'A delicate herbal tea known for its calming and relaxing properties. It has a light, floral, and slightly sweet flavor.', isHot: true },
  { id: '10', name: 'Black Tea', price: 3.80, category: 'non-coffee', description: 'A robust and full-bodied tea, often served with milk and sugar. It\'s a traditional choice with a strong, earthy flavor.', isHot: true },
  { id: '11', name: 'Earl Grey', price: 2.80, category: 'non-coffee', description: 'A fragrant black tea flavored with oil from the rind of bergamot orange. It has a distinctive citrus and floral aroma.', isHot: true },
  { id: '12', name: 'Breakfast Tea', price: 3.50, category: 'non-coffee', description: 'A blend of black teas, usually Assam, Ceylon, and Kenyan. It\'s a classic, strong, and malty tea perfect for starting the day.', isHot: true },
  { id: '13', name: 'Green Tea', price: 4.00, category: 'non-coffee', description: 'A tea made from unoxidized leaves. It has a light, fresh, and sometimes grassy flavor, often associated with its many health benefits.', isHot: true },
  { id: '14', name: 'Jasmine Tea', price: 5.00, category: 'non-coffee', description: 'A fragrant green tea scented with jasmine blossoms. It\'s known for its delicate, sweet aroma and a clean, refreshing taste.', isHot: true },
  { id: '15', name: 'Lychee Tea', price: 4.80, category: 'non-coffee', description: 'A fruity tea with a sweet and slightly floral taste from the lychee fruit. It\'s often served iced and is a refreshing choice.', isHot: false },
  { id: '16', name: 'Milk Tea', price: 3.50, category: 'non-coffee', description: 'A creamy and comforting tea made with a mix of tea and milk. It\'s a popular, classic drink with a smooth texture.', isHot: true },

  // Food
  { id: '17', name: 'Cinnamon Roll', price: 2.00, category: 'food', description: 'A soft, sweet dough rolled with a delicious cinnamon-sugar filling, often topped with a light glaze.' },
  { id: '18', name: 'Almond Roll', price: 3.00, category: 'food', description: 'A pastry with a sweet almond paste filling, offering a rich and nutty flavor.' },
  { id: '19', name: 'Banana Bread', price: 3.50, category: 'food', description: 'A moist, sweet loaf made with ripe bananas. It\'s a simple, comforting classic.' },
  { id: '20', name: 'Choco Muffin', price: 3.50, category: 'food', description: 'A rich, chocolate-flavored muffin often filled with chocolate chips. A perfect treat for chocolate lovers.' },
  { id: '21', name: 'Glazed Donut', price: 2.00, category: 'food', description: 'A classic deep-fried dough pastry with a sweet sugar glaze. A simple and satisfying treat.' },
  { id: '22', name: 'Grilled Cheese', price: 3.00, category: 'food', description: 'A classic comfort food of melted cheese between two slices of toasted bread.' },
  { id: '23', name: 'Chicken Bread', price: 3.50, category: 'food', description: 'Savory bread baked with a filling of seasoned chicken.' },
  { id: '24', name: 'Tuna Puff', price: 3.00, category: 'food', description: 'A light, flaky pastry filled with a savory mixture of tuna.' },

  // Sri Lankan Coffee
  { id: '25', name: 'Ceylon Brew', price: 4.50, category: 'sri-lankan-coffee', description: 'Strong black coffee made with locally sourced Sri Lankan coffee beans', isHot: true },
  { id: '26', name: 'Kithul Latte', price: 5.20, category: 'sri-lankan-coffee', description: 'Classic latte sweetened with kithul treacle, a traditional Sri Lankan syrup', isHot: true },
  { id: '27', name: 'Cardamom Cappuccino', price: 4.80, category: 'sri-lankan-coffee', description: 'Cappuccino infused with aromatic cardamom spice', isHot: true },
  { id: '28', name: 'Spiced Iced Coffee', price: 4.20, category: 'sri-lankan-coffee', description: 'Iced coffee with cinnamon and ginger', isHot: false },
  { id: '29', name: 'Coconut Cream Frappe', price: 5.80, category: 'sri-lankan-coffee', description: 'Blended coffee with tropical coconut cream', isHot: false },

  // Sri Lankan Non-Coffee
  { id: '30', name: 'Masala Chai', price: 4.00, category: 'sri-lankan-non-coffee', description: 'Spicy tea latte with ginger, cardamom, and spices', isHot: true },
  { id: '31', name: 'Iced Butterfly Pea Flower Tea', price: 4.50, category: 'sri-lankan-non-coffee', description: 'Vibrant blue tea that changes color with lime', isHot: false },
  { id: '32', name: 'Ginger Tea (Inguru Kahata)', price: 3.20, category: 'sri-lankan-non-coffee', description: 'Invigorating tea with fresh ginger', isHot: true },
  { id: '33', name: 'Passion Fruit & Mint Cooler', price: 4.80, category: 'sri-lankan-non-coffee', description: 'Refreshing drink with local passion fruit and mint', isHot: false },
  { id: '34', name: 'Watalappan Milkshake', price: 5.50, category: 'sri-lankan-non-coffee', description: 'Unique milkshake inspired by Sri Lankan dessert', isHot: false },

  // Sri Lankan Food
  { id: '35', name: 'Pol Sambol & Cheese Toastie', price: 4.50, category: 'sri-lankan-food', description: 'Grilled sandwich with coconut sambol and cheese' },
  { id: '36', name: 'Kochchi Chicken Puff', price: 4.00, category: 'sri-lankan-food', description: 'Flaky pastry with spicy chicken and kochchi chilies' },
  { id: '37', name: 'Seeni Sambol Bun', price: 3.80, category: 'sri-lankan-food', description: 'Soft bun with caramelized onion relish' },
  { id: '38', name: 'Fish Patties', price: 4.20, category: 'sri-lankan-food', description: 'Deep-fried pastries with spiced fish and potato' },
  { id: '39', name: 'Kiri Pani Cheesecake', price: 5.00, category: 'sri-lankan-food', description: 'Cheesecake with buffalo curd and kithul treacle' },
  { id: '40', name: 'Love Cake Slice', price: 4.50, category: 'sri-lankan-food', description: 'Traditional cake with semolina, cashews, and spices' },
  { id: '41', name: 'Banana Fritters', price: 3.50, category: 'sri-lankan-food', description: 'Golden fried banana slices with kithul treacle' },
];

export const MenuPage = () => {
  const [showChat, setShowChat] = useState(false);
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("coffee");
  const { toast } = useToast();

  const addToCart = (item: MenuItem) => {
    setCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
    toast({
      title: "Added to cart",
      description: `${item.name} added to your cart`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const toggleWishlist = (itemId: string) => {
    setWishlist(prev => {
      const updated = new Set(prev);
      if (updated.has(itemId)) {
        updated.delete(itemId);
        toast({
          title: "Removed from wishlist",
          description: "Item removed from your favorites",
        });
      } else {
        updated.add(itemId);
        toast({
          title: "Added to wishlist",
          description: "Item added to your favorites",
        });
      }
      return updated;
    });
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(i => i.id === itemId);
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const getFilteredItems = (categories: string[]) => {
    return menuItems.filter(item => categories.includes(item.category));
  };

  if (showChat) {
    return <ChatInterface onBack={() => setShowChat(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coffee className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                BrewMind Menu
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowChat(true)}
                className="border-primary/20"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat with AI
              </Button>
              
              <div className="relative">
                <Button variant="outline" className="border-primary/20">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart ({getTotalItems()})
                </Button>
                {getTotalItems() > 0 && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {getTotalItems()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="coffee">Coffee</TabsTrigger>
            <TabsTrigger value="non-coffee">Tea & More</TabsTrigger>
            <TabsTrigger value="food">Food</TabsTrigger>
            <TabsTrigger value="sri-lankan">Sri Lankan Specials</TabsTrigger>
            <TabsTrigger value="cart">Cart</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          </TabsList>

          <TabsContent value="coffee" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredItems(['coffee']).map((item) => (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  cartQuantity={cart[item.id] || 0}
                  isWishlisted={wishlist.has(item.id)}
                  onAddToCart={() => addToCart(item)}
                  onRemoveFromCart={() => removeFromCart(item.id)}
                  onToggleWishlist={() => toggleWishlist(item.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="non-coffee" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredItems(['non-coffee']).map((item) => (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  cartQuantity={cart[item.id] || 0}
                  isWishlisted={wishlist.has(item.id)}
                  onAddToCart={() => addToCart(item)}
                  onRemoveFromCart={() => removeFromCart(item.id)}
                  onToggleWishlist={() => toggleWishlist(item.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="food" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredItems(['food']).map((item) => (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  cartQuantity={cart[item.id] || 0}
                  isWishlisted={wishlist.has(item.id)}
                  onAddToCart={() => addToCart(item)}
                  onRemoveFromCart={() => removeFromCart(item.id)}
                  onToggleWishlist={() => toggleWishlist(item.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sri-lankan" className="space-y-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Sri Lankan Coffee</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredItems(['sri-lankan-coffee']).map((item) => (
                    <MenuItemCard 
                      key={item.id} 
                      item={item} 
                      cartQuantity={cart[item.id] || 0}
                      isWishlisted={wishlist.has(item.id)}
                      onAddToCart={() => addToCart(item)}
                      onRemoveFromCart={() => removeFromCart(item.id)}
                      onToggleWishlist={() => toggleWishlist(item.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Sri Lankan Beverages</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredItems(['sri-lankan-non-coffee']).map((item) => (
                    <MenuItemCard 
                      key={item.id} 
                      item={item} 
                      cartQuantity={cart[item.id] || 0}
                      isWishlisted={wishlist.has(item.id)}
                      onAddToCart={() => addToCart(item)}
                      onRemoveFromCart={() => removeFromCart(item.id)}
                      onToggleWishlist={() => toggleWishlist(item.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Sri Lankan Food</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredItems(['sri-lankan-food']).map((item) => (
                    <MenuItemCard 
                      key={item.id} 
                      item={item} 
                      cartQuantity={cart[item.id] || 0}
                      isWishlisted={wishlist.has(item.id)}
                      onAddToCart={() => addToCart(item)}
                      onRemoveFromCart={() => removeFromCart(item.id)}
                      onToggleWishlist={() => toggleWishlist(item.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cart" className="space-y-6">
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
              {Object.keys(cart).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(cart).map(([itemId, quantity]) => {
                    const item = menuItems.find(i => i.id === itemId);
                    if (!item) return null;
                    return (
                      <div key={itemId} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => removeFromCart(itemId)}
                              className="h-8 w-8"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => addToCart(item)}
                              className="h-8 w-8"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="font-semibold min-w-16 text-right">
                            ${(item.price * quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <Button className="w-full mt-4" size="lg">
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-6">
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Your Wishlist</h2>
              {wishlist.size === 0 ? (
                <p className="text-muted-foreground text-center py-8">Your wishlist is empty</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from(wishlist).map((itemId) => {
                    const item = menuItems.find(i => i.id === itemId);
                    if (!item) return null;
                    return (
                      <MenuItemCard 
                        key={item.id} 
                        item={item} 
                        cartQuantity={cart[item.id] || 0}
                        isWishlisted={true}
                        onAddToCart={() => addToCart(item)}
                        onRemoveFromCart={() => removeFromCart(item.id)}
                        onToggleWishlist={() => toggleWishlist(item.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface MenuItemCardProps {
  item: MenuItem;
  cartQuantity: number;
  isWishlisted: boolean;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
  onToggleWishlist: () => void;
}

const MenuItemCard = ({ 
  item, 
  cartQuantity, 
  isWishlisted, 
  onAddToCart, 
  onRemoveFromCart, 
  onToggleWishlist 
}: MenuItemCardProps) => {
  return (
    <Card className="hover:shadow-warm transition-all duration-300 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Coffee 
              className={`h-5 w-5 ${
                item.isHot === true ? 'text-orange-500' : 
                item.isHot === false ? 'text-blue-500' : 
                'text-primary'
              }`} 
            />
            {item.isHot !== undefined && (
              <Badge variant={item.isHot ? "default" : "secondary"}>
                {item.isHot ? "Hot" : "Cold"}
              </Badge>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleWishlist}
            className="h-8 w-8"
          >
            <Heart 
              className={`h-4 w-4 ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              }`} 
            />
          </Button>
        </div>
        
        <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
        {item.description && (
          <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
            {item.description}
          </p>
        )}
        <p className="text-2xl font-bold text-primary mb-4">
          ${item.price.toFixed(2)}
        </p>
        
        <div className="flex items-center gap-2">
          {cartQuantity > 0 ? (
            <div className="flex items-center gap-2 flex-1">
              <Button
                size="sm"
                variant="outline"
                onClick={onRemoveFromCart}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-center min-w-8">{cartQuantity}</span>
              <Button
                size="sm"
                onClick={onAddToCart}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={onAddToCart} className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};