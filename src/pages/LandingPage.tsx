import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Shield, Zap, Users, ArrowRight, Star } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/dashboard');
  };
  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "High Yield Staking",
      description: "Earn up to 12.4% APY on your crypto holdings with our optimized staking pools"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Audited",
      description: "Smart contracts audited by leading security firms for maximum protection"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Rewards",
      description: "Real-time reward tracking with flexible claiming options"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Driven",
      description: "Join thousands of users earning passive income through staking"
    }
  ];

  const stats = [
    { label: "Total Value Locked", value: "$45.2M", change: "+12.5%" },
    { label: "Active Stakers", value: "8,429", change: "+8.2%" },
    { label: "Total Rewards Paid", value: "$2.1M", change: "+15.7%" },
    { label: "Average APY", value: "8.4%", change: "+2.1%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center glow">
                <span className="text-white text-3xl font-bold">S</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Stake Smart,
              </span>
              <br />
              <span className="text-white">Earn More</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              The most advanced DeFi staking platform. Maximize your crypto returns with 
              our secure, high-yield staking pools and earn passive income 24/7.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all glow flex items-center gap-2"
              >
                Start Staking
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-white/20 text-white rounded-xl font-semibold text-lg hover:border-purple-500/50 hover:bg-white/10 transition-all"
              >
                View Pools
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 mb-1">{stat.label}</div>
                <div className="text-green-400 text-sm">{stat.change}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built with cutting-edge technology and designed for maximum returns
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 group"
              >
                <div className="text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-gray-400 text-lg">See what our community says</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: "Alex Chen", role: "DeFi Investor", content: "Best staking platform I've used. Clean interface and great returns!", rating: 5 },
              { name: "Sarah Johnson", role: "Crypto Trader", content: "Love the real-time tracking and multiple pool options. Highly recommended!", rating: 5 },
              { name: "Mike Rodriguez", role: "Portfolio Manager", content: "Professional grade platform with excellent security. Perfect for institutional use.", rating: 5 }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={`star-${testimonial.name}-${i}`} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Join thousands of users already earning passive income through our secure staking platform
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all glow"
            >
              Connect Wallet & Start Staking
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
