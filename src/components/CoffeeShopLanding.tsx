import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, MessageCircle, Calendar, CloudSun, Heart, Sparkles } from "lucide-react";
import { ChatInterface } from "./ChatInterface";

export const CoffeeShopLanding = () => {
  const [showChat, setShowChat] = useState(false);

  const features = [
    {
      icon: MessageCircle,
      title: "AI Barista Chat",
      description: "Talk naturally with our AI agent for personalized coffee recommendations"
    },
    {
      icon: CloudSun,
      title: "Weather-Based Suggestions",
      description: "Get perfect coffee recommendations based on today's weather"
    },
    {
      icon: Calendar,
      title: "Coffee Appointments",
      description: "Book coffee meetings and therapy sessions with ease"
    },
    {
      icon: Heart,
      title: "Remember Your Taste",
      description: "We remember your preferences and favorite orders"
    }
  ];

  const popularDrinks = [
    { name: "Cappuccino Supreme", price: "$4.50", hot: true },
    { name: "Iced Vanilla Latte", price: "$5.20", hot: false },
    { name: "Espresso Shot", price: "$2.80", hot: true },
    { name: "Cold Brew Delight", price: "$4.80", hot: false }
  ];

  if (showChat) {
    return <ChatInterface onBack={() => setShowChat(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/50 to-accent/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
        <div className="container mx-auto px-6 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Coffee className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                BrewMind Coffee
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your AI-Powered
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Coffee Experience
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Meet your personal AI barista who understands your taste, suggests perfect drinks based on weather, 
              and even provides therapeutic conversations over coffee.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg font-semibold shadow-warm hover:shadow-lg transition-all duration-300"
                onClick={() => setShowChat(true)}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat with AI Barista
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg border-primary/20 hover:bg-primary/5"
                onClick={() => window.location.href = '/menu'}
              >
                <Coffee className="mr-2 h-5 w-5" />
                View Menu
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4" />
              AI-Powered Features
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Why Choose BrewMind?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the future of coffee ordering with our intelligent AI agent
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-warm transition-all duration-300 border-border/50">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Drinks Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Popular This Month</h2>
            <p className="text-muted-foreground text-lg">
              Our customers' favorite picks, curated by AI insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {popularDrinks.map((drink, index) => (
              <Card key={index} className="hover:shadow-warm transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Coffee className={`h-5 w-5 ${drink.hot ? 'text-orange-500' : 'text-blue-500'}`} />
                    <Badge variant={drink.hot ? "default" : "secondary"}>
                      {drink.hot ? "Hot" : "Cold"}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{drink.name}</h3>
                  <p className="text-2xl font-bold text-primary">{drink.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready for Your Perfect Cup?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let our AI barista understand your mood, preferences, and the weather to craft the perfect coffee experience just for you.
          </p>
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg font-semibold shadow-warm hover:shadow-lg transition-all duration-300"
            onClick={() => setShowChat(true)}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Start Chatting Now
          </Button>
        </div>
      </section>
    </div>
  );
};