// import { Home, CalendarDays, BarChart3, TrendingUp, User } from 'lucide-react';


// interface BottomNavigationProps {
//   currentScreen: Screen;
//   onNavigate: (screen: Screen) => void;
// }

// export function BottomNavigation({ currentScreen, onNavigate }: BottomNavigationProps) {
//   const navItems = [
//     { screen: 'home' as Screen, icon: Home, label: 'Home' },
//     { screen: 'diet-plan' as Screen, icon: CalendarDays, label: 'Plan' },
//     { screen: 'meal-tracking' as Screen, icon: BarChart3, label: 'Track' },
//     { screen: 'health-insights' as Screen, icon: TrendingUp, label: 'Insights' },
//     { screen: 'profile' as Screen, icon: User, label: 'Profile' },
//   ];

//   return (
//     <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 rounded-t-3xl shadow-lg">
//       <div className="flex justify-around items-center">
//         {navItems.map((item) => {
//           const Icon = item.icon;
//           const isActive = currentScreen === item.screen;
          
//           return (
//             <button
//               key={item.screen}
//               onClick={() => onNavigate(item.screen)}
//               className={`flex flex-col items-center gap-1 transition-all ${
//                 isActive 
//                   ? 'text-[#3BB273] scale-105' 
//                   : 'text-gray-400 hover:text-gray-600'
//               }`}
//             >
//               <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
//               <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
//                 {item.label}
//               </span>
//               {isActive && (
//                 <div className="w-1 h-1 rounded-full bg-[#3BB273] mt-0.5" />
//               )}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
