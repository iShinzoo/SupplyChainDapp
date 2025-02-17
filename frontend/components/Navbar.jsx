import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = () => {
  

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50"
    >
      {/* Gradient Border Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#0B1120] " />
      
      {/* Blur Background */}
      <div className="relative bg-[#0B1120] border-b border-gray-800/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="relative w-10 h-10">
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                  animate={{
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <div className="absolute inset-[2px] rounded-lg bg-[#0B1120] flex items-center justify-center">
                  <span className="text-xl">🚀</span>
                </div>
              </div>
              <div className="relative group">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Shipment Tracker
                </span>
                <div className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transition-all duration-300" />
              </div>
            </motion.div>

          

            {/* Connect Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative group"
            >
              <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur group-hover:blur-md transition-all duration-300" />
              <div className="relative bg-[#0B1120] rounded-lg p-[1px] group-hover:bg-opacity-80 transition-all duration-300">
                <ConnectButton
                  showBalance={true}
                  accountStatus="address"
                  chainStatus="icon"
                  className="!bg-transparent"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;