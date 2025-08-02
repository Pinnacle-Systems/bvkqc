import { useState, useEffect } from 'react';
import { Eye, EyeOff, Zap, Server, Database, Cpu, FlaskConical, ShoppingCart, Hospital, Factory } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from "react-secure-storage";
import axios from "axios";
import { LOGIN_API } from '../../../Api';
import { generateSessionId } from '../../../Utils/helper';
import Modal from '../../../UiComponents/Modal';
import BranchAndFinYearForm from '../../components/BranchAndFinyear';
import { PRODUCT_ADMIN_HOME_PATH } from '../../../Route/urlPaths';
import { toast } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isGlobalOpen, setIsGlobalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [planExpirationDate, setPlanExpirationDate] = useState("");
  const [activeProduct, setActiveProduct] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const products = [
    { icon: <Factory className="h-6 w-6 text-indigo-400" />, title: "Textile ERP", bg: "bg-gradient-to-br from-indigo-500 to-purple-600" },
    { icon: <Hospital className="h-6 w-6 text-emerald-400" />, title: "Hospital Management", bg: "bg-gradient-to-br from-emerald-500 to-teal-600" },
    { icon: <FlaskConical className="h-6 w-6 text-amber-400" />, title: "Textile Lab ERP", bg: "bg-gradient-to-br from-amber-500 to-orange-600" },
    { icon: <Cpu className="h-6 w-6 text-blue-400" />, title: "Hardware Solutions", bg: "bg-gradient-to-br from-blue-500 to-cyan-600" },
    { icon: <Server className="h-6 w-6 text-violet-400" />, title: "Cloud & IoT", bg: "bg-gradient-to-br from-violet-500 to-fuchsia-600" },
    { icon: <ShoppingCart className="h-6 w-6 text-rose-400" />, title: "Retail POS", bg: "bg-gradient-to-br from-rose-500 to-pink-600" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveProduct((prev) => (prev + 1) % products.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const validate = () => {
    const errors = {};
    if (!username) errors.email = "Username is required";
    if (!password) errors.password = "Password is required";
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validateErrors = validate();
    setErrors(validateErrors);
    
    if (Object.keys(validateErrors).length === 0) {
      setLoading(true);
      axios({
        method: "post",
        url: BASE_URL + LOGIN_API,
        data: { username, password },
      }).then(
        (result) => {
          if (result.status === 200) {
            if (result.data.statusCode === 0) {
              sessionStorage.setItem("sessionId", generateSessionId());
              if (!result.data.userInfo.roleId) {
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "userId",
                  result.data.userInfo.id
                );
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "username",
                  result.data.userInfo.username
                );
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "userType",
                  result.data.userInfo.userType
                );
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "partyId",
                  result.data.userInfo.partyType
                );
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "superAdmin",
                  true
                );
                navigate(PRODUCT_ADMIN_HOME_PATH);
              } else {
                const currentPlanActive =
                  result.data.userInfo.role.company.Subscription.some(
                    (sub) => sub.planStatus
                  );
                if (currentPlanActive) {
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "employeeId",
                    result.data.userInfo.employeeId
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userId",
                    result.data.userInfo.id
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "username",
                    result.data.userInfo.username
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userEmail",
                    result.data.userInfo.email
                  );
                    secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userCompanyId",
                    result.data.userInfo.role.companyId
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userCompanyId",
                    result.data.userInfo.role.companyId
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "defaultAdmin",
                    JSON.stringify(result.data.userInfo.role.defaultRole)
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userRoleId",
                    result.data.userInfo.roleId
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "partyId",
                    result.data.userInfo.partyType
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "latestActivePlanExpireDate",
                    new Date(
                      result.data.userInfo.role.company.Subscription[0].expireAt
                    ).toDateString()
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userRole",
                    result.data.userInfo.role.name
                  );
                  setIsGlobalOpen(true);                             
                } else {
                  const expireDate = new Date(
                    result.data.userInfo.role.company.Subscription[0].expireAt
                  );
                  setPlanExpirationDate(expireDate.toDateString());
                }
              }
            } else {
              toast.error(result.data.message);
            }
          }
          setLoading(false);
        },
        (error) => {
          console.log(error);
          toast.error("Server Down", { autoClose: 5000 });
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isGlobalOpen}
        onClose={() => setIsGlobalOpen(false)}
        widthClass={""}
      >
        <BranchAndFinYearForm setIsGlobalOpen={setIsGlobalOpen} />
      </Modal>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 overflow-hidden relative p-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white/5"
              style={{
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 300 + 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(40px)',
                animation: `pulse ${Math.random() * 10 + 10}s infinite alternate`
              }}
            />
          ))}
        </div>

        {/* Main container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl backdrop-blur-lg bg-white/5 border border-white/10">
            {/* Product showcase - left side */}
            <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col">
              {/* <div className="mb-8">
                <div className="flex items-center space-x-3">
                  <Zap className="h-8 w-8 text-yellow-400 animate-pulse" />
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500">
                    PINNACLE SYSTEMS
                  </span>
                </div>
              </div> */}

              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                  Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Solutions</span> <br/>For Modern Businesses
                </h2>
                
                <div className="relative h-40 mb-8">
                  {products.map((product, index) => (
                    <div 
                      key={index}
                      className={`absolute inset-0 transition-all duration-500 ease-in-out rounded-2xl p-6 flex flex-col justify-end ${product.bg} 
                        ${index === activeProduct ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                    >
                      <div className="text-white">
                        <div className="flex items-center mb-4">
                          {product.icon}
                          <h3 className="text-2xl font-bold ml-3">{product.title}</h3>
                        </div>
                        <p className="text-white/80">
                          {index === 0 && "Comprehensive textile manufacturing solution with inventory and production management"}
                          {index === 1 && "Integrated hospital management system for patient care and administration"}
                          {index === 2 && "Specialized ERP for textile testing labs with quality control features"}
                          {index === 3 && "Custom hardware configurations and IT infrastructure solutions"}
                          {index === 4 && "Cloud-based systems with IoT integration for real-time analytics"}
                          {index === 5 && "Retail point of sale with inventory and customer management"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2 justify-center">
                  {products.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveProduct(index)}
                      className={`h-2 w-2 rounded-full transition-all ${index === activeProduct ? 'bg-white w-6' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Login form - right side */}
            <div className="w-full lg:w-1/2 p-8 md:p-12 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400 mb-8">Sign in to your dashboard</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <div className="relative">
                      <input
                        className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 pr-12"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        className="h-4 w-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3.5 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center group"
                    disabled={loading}
                  >
                    {loading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <span className="group-hover:scale-110 transition-transform">Access Platform</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                    New to Pinnacle? {' '}
                    <a 
                      onClick={() => navigate('/register')} 
                      className="text-blue-400 hover:text-blue-300 cursor-pointer font-medium transition-colors"
                    >
                      Create an account
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
          100% { opacity: 0.1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default Login;