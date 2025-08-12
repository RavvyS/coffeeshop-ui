// Replace the existing src/components/MenuPage.tsx with this updated version

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, Heart, MessageCircle, ShoppingCart, Plus, Minus, RefreshCw, Loader2 } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { useMenu, MenuItem } from "@/hooks/useMenu";
import { useOrder } from "@/hooks/useOrder";
import { toast } from "@/hooks/use-toast";

export const MenuPage = () => {
  const [showChat, setShowChat] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("coffee");

  // Use real menu and order hooks
  const { 
    items: menuItems, 
    categories, 
    isLoading: menuLoading, 
    error: menuError, 
    refreshMenu,
    getItemsByCategory 
  } = useMenu();

  const {
    cart,
    isLoading: orderLoading,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    createOrder,
    calculateTotals
  } = useOrder();

  // Convert cart to lookup for quantities
  const cartQuantities = cart.reduce((acc, item) => {
    acc[item.menuItemId] = (acc[item.menuItemId] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

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

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item, 1);
  };

  const handleRemoveFromCart = (item: MenuItem) => {
    const cartItem = cart.find(ci => ci.menuItemId === item.id);
    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateCartItem(cartItem.id, cartItem.quantity - 1);
      } else {
        removeFromCart(cartItem.id);
      }
    }
  };

  const getTotalPrice = () => {
    const { total } = calculateTotals();
    return total;
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getFilteredItems = (categories: string[]) => {
    return menuItems.filter(item => categories.includes(item.category));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to cart before checking out",
        variant: "destructive",
      });
      return;
    }

    try {
      const order = await createOrder();
      if (order) {
        // Navigate to payment or confirmation
        toast({
          title: "Order created",
          description: `Order #${order.id} created successfully`,
        });
        // Here you could redirect to payment page
        // window.location.href = `/payment/${order.id}`;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    }
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
              {menuLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
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

              {menuError && (
                <Button
                  variant="outline"
                  onClick={refreshMenu}
                  className="border-orange-500/20 text-orange-600"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              )}
              
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="border-primary/20"
                  disabled={orderLoading}
                >
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
        {menuError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              Failed to load menu: {menuError}. Using offline menu.
            </p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="coffee">Coffee</TabsTrigger>
            <TabsTrigger value="non-coffee">Tea & More</TabsTrigger>
            <TabsTrigger value="food">Food</TabsTrigger>
            <TabsTrigger value="sri-lankan">Sri Lankan Specials</TabsTrigger>
            <TabsTrigger value="cart">Cart ({getTotalItems()})</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          </TabsList>

          <TabsContent value="coffee" className="space-y-6">
            {menuLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-20 bg-gray-100 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-10 bg-gray-100 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredItems(['coffee']).map((item) => (
                  <MenuItemCard 
                    key={item.id} 
                    item={item} 
                    cartQuantity={cartQuantities[item.id] || 0}
                    isWishlisted={wishlist.has(item.id)}
                    onAddToCart={() => handleAddToCart(item)}
                    onRemoveFromCart={() => handleRemoveFromCart(item)}
                    onToggleWishlist={() => toggleWishlist(item.id)}
                    isLoading={orderLoading}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="non-coffee" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredItems(['non-coffee']).map((item) => (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  cartQuantity={cartQuantities[item.id] || 0}
                  isWishlisted={wishlist.has(item.id)}
                  onAddToCart={() => handleAddToCart(item)}
                  onRemoveFromCart={() => handleRemoveFromCart(item)}
                  onToggleWishlist={() => toggleWishlist(item.id)}
                  isLoading={orderLoading}
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
                  cartQuantity={cartQuantities[item.id] || 0}
                  isWishlisted={wishlist.has(item.id)}
                  onAddToCart={() => handleAddToCart(item)}
                  onRemoveFromCart={() => handleRemoveFromCart(item)}
                  onToggleWishlist={() => toggleWishlist(item.id)}
                  isLoading={orderLoading}
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
                      cartQuantity={cartQuantities[item.id] || 0}
                      isWishlisted={wishlist.has(item.id)}
                      onAddToCart={() => handleAddToCart(item)}
                      onRemoveFromCart={() => handleRemoveFromCart(item)}
                      onToggleWishlist={() => toggleWishlist(item.id)}
                      isLoading={orderLoading}
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
                      cartQuantity={cartQuantities[item.id] || 0}
                      isWishlisted={wishlist.has(item.id)}
                      onAddToCart={() => handleAddToCart(item)}
                      onRemoveFromCart={() => handleRemoveFromCart(item)}
                      onToggleWishlist={() => toggleWishlist(item.id)}
                      isLoading={orderLoading}
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
                      cartQuantity={cartQuantities[item.id] || 0}
                      isWishlisted={wishlist.has(item.id)}
                      onAddToCart={() => handleAddToCart(item)}
                      onRemoveFromCart={() => handleRemoveFromCart(item)}
                      onToggleWishlist={() => toggleWishlist(item.id)}
                      isLoading={orderLoading}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cart" className="space-y-6">
            <div className="bg-card rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Cart</h2>
                {cart.length > 0 && (
                  <Button variant="outline" onClick={clearCart} disabled={orderLoading}>
                    Clear Cart
                  </Button>
                )}
              </div>
              
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((cartItem) => {
                    const menuItem = menuItems.find(mi => mi.id === cartItem.menuItemId);
                    if (!menuItem) return null;
                    
                    return (
                      <div key={cartItem.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                        <div>
                          <h3 className="font-semibold">{menuItem.name}</h3>
                          <p className="text-muted-foreground">${cartItem.price.toFixed(2)} each</p>
                          {cartItem.customizations && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {cartItem.customizations.size && <span>Size: {cartItem.customizations.size} </span>}
                              {cartItem.customizations.milk && <span>Milk: {cartItem.customizations.milk}</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateCartItem(cartItem.id, cartItem.quantity - 1)}
                              className="h-8 w-8"
                              disabled={orderLoading}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{cartItem.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateCartItem(cartItem.id, cartItem.quantity + 1)}
                              className="h-8 w-8"
                              disabled={orderLoading}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="font-semibold min-w-16 text-right">
                            ${(cartItem.price * cartItem.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="border-t border-border/50 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${calculateTotals().subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${calculateTotals().tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span>${calculateTotals().total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      size="lg" 
                      onClick={handleCheckout}
                      disabled={orderLoading || cart.length === 0}
                    >
                      {orderLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Proceed to Checkout'
                      )}
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
                        cartQuantity={cartQuantities[item.id] || 0}
                        isWishlisted={true}
                        onAddToCart={() => handleAddToCart(item)}
                        onRemoveFromCart={() => handleRemoveFromCart(item)}
                        onToggleWishlist={() => toggleWishlist(item.id)}
                        isLoading={orderLoading}
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
  isLoading?: boolean;
}

const MenuItemCard = ({ 
  item, 
  cartQuantity, 
  isWishlisted, 
  onAddToCart, 
  onRemoveFromCart, 
  onToggleWishlist,
  isLoading = false
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
            {item.availability && !item.availability.isAvailable && (
              <Badge variant="destructive">Unavailable</Badge>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleWishlist}
            className="h-8 w-8"
            disabled={isLoading}
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
        
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold text-primary">
            ${item.price.toFixed(2)}
          </p>
          {item.availability?.estimatedTime && (
            <Badge variant="outline" className="text-xs">
              ~{item.availability.estimatedTime}min
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {cartQuantity > 0 ? (
            <div className="flex items-center gap-2 flex-1">
              <Button
                size="sm"
                variant="outline"
                onClick={onRemoveFromCart}
                className="h-8 w-8 p-0"
                disabled={isLoading}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-center min-w-8">{cartQuantity}</span>
              <Button
                size="sm"
                onClick={onAddToCart}
                className="h-8 w-8 p-0"
                disabled={isLoading || (item.availability && !item.availability.isAvailable)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={onAddToCart} 
              className="flex-1"
              disabled={isLoading || (item.availability && !item.availability.isAvailable)}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add to Cart
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};