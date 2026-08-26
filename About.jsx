import { motion } from 'framer-motion';
import { Users, Target, Heart, Award } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-28 lg:py-36 bg-haryana-cream relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-folk-pattern opacity-20"></div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-haryana-dark mb-4">
            About <span className="text-gradient">Haryanvi Mandli</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-haryana-red to-haryana-mustard mx-auto"></div>
        </motion.div>

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 folk-border"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-haryana-dark mb-4">Our History</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Haryanvi Mandli was established in <span className="font-semibold text-haryana-red">2014</span> by the visionary 
                <span className="font-semibold text-haryana-red"> Kadir Khan</span> at DCRUST (Deenbandhu Chhotu Ram University of Science and Technology). 
                What started as a small initiative has grown into a vibrant cultural society that celebrates and preserves 
                the rich heritage of Haryana.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Over the years, we have become the face of Haryanvi culture on campus and beyond, performing at prestigious 
                platforms including IITs, NITs, state universities, and national cultural festivals.
              </p>
            </div>
            <div className="bg-gradient-to-br from-haryana-red/10 to-haryana-mustard/10 rounded-xl p-8 text-center">
              <div className="text-6xl font-bold text-gradient mb-2">2014</div>
              <div className="text-xl text-haryana-dark font-semibold">Founded</div>
              <div className="text-gray-600 mt-2">With a vision to preserve Haryana's cultural heritage</div>
            </div>
          </div>
        </motion.div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-haryana-red to-haryana-mustard rounded-full flex items-center justify-center mb-6">
              <Target className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-haryana-dark mb-4">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              To be the leading cultural society that preserves, promotes, and propagates the rich folk traditions, 
              arts, and cultural heritage of Haryana across the nation and beyond.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-haryana-red to-haryana-mustard rounded-full flex items-center justify-center mb-6">
              <Heart className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-haryana-dark mb-4">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              To provide a platform for students to explore and showcase their talents in traditional dance, music, 
              theatre, and fine arts while keeping the spirit of Haryanvi culture alive.
            </p>
          </motion.div>
        </div>

        {/* Founder Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gradient-to-r from-haryana-dark to-haryana-earth rounded-2xl shadow-xl p-8 md:p-12 text-white"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-36 h-36 md:w-44 md:h-44 bg-gradient-to-br from-haryana-mustard to-haryana-red rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden border-4 border-haryana-mustard shadow-xl">
              <img src="/pictures/kadir khan.jpeg" alt="Kadir Khan" className="w-full h-full object-cover object-[center_15%]" onError={e => { e.target.style.display = 'none'; }} />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold mb-2">Our Founder</h3>
              <div className="text-2xl text-haryana-mustard font-semibold mb-4">Kadir Khan</div>
              <p className="text-white/90 leading-relaxed max-w-2xl">
                A visionary educator and cultural enthusiast, Kadir Khan founded Haryanvi Mandli with the belief that 
                art and culture are essential for holistic development. His dedication and passion have inspired 
                countless students to embrace their cultural roots and showcase their talents on national stages.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
        >
          {[
            { icon: Award, label: 'Awards Won', value: '50+' },
            { icon: Users, label: 'Active Members', value: '50+' },
            { icon: Target, label: 'Events Performed', value: '100+' },
            { icon: Heart, label: 'Years of Excellence', value: '10+' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <stat.icon className="text-haryana-red mx-auto mb-3" size={32} />
              <div className="text-3xl font-bold text-gradient">{stat.value}</div>
              <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default About;
