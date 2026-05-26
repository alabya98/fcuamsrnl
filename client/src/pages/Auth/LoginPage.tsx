import { useState, type FC, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../../assets/Logo.png";

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAccountDeactivated, setIsAccountDeactivated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    try {
      e.preventDefault();
      setError("");
      setIsAccountDeactivated(false);
      setLoading(true);

      await login(username, password);
      navigate("/");
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const message =
          error.response.data.errors?.username?.[0] || "Invalid credentials";

        if (message.includes("deactivated")) {
          setIsAccountDeactivated(true);
          setError(message);
        } else {
          setIsAccountDeactivated(false);
          setError(message);
        }
      } else {
        setIsAccountDeactivated(false);
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0f1f35 0%, #1a3a5c 40%, #0f2d4a 70%, #0a1a2e 100%)",
      }}
    >
      {/* ── Sporty SVG Background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Diagonal Speed Lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Speed stripes - top left to bottom right */}
          <line
            x1="-10%"
            y1="10%"
            x2="60%"
            y2="110%"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="60"
          />
          <line
            x1="10%"
            y1="-5%"
            x2="80%"
            y2="95%"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="40"
          />
          <line
            x1="30%"
            y1="-15%"
            x2="110%"
            y2="85%"
            stroke="rgba(255,255,255,0.025)"
            strokeWidth="80"
          />
          <line
            x1="-30%"
            y1="30%"
            x2="50%"
            y2="130%"
            stroke="rgba(57,107,153,0.15)"
            strokeWidth="50"
          />
          <line
            x1="50%"
            y1="-20%"
            x2="130%"
            y2="80%"
            stroke="rgba(57,107,153,0.1)"
            strokeWidth="35"
          />
          <line
            x1="70%"
            y1="-10%"
            x2="150%"
            y2="90%"
            stroke="rgba(255,255,255,0.02)"
            strokeWidth="55"
          />

          {/* Accent color stripes */}
          <line
            x1="-5%"
            y1="20%"
            x2="55%"
            y2="120%"
            stroke="rgba(99,179,237,0.07)"
            strokeWidth="20"
          />
          <line
            x1="20%"
            y1="-10%"
            x2="90%"
            y2="100%"
            stroke="rgba(99,179,237,0.05)"
            strokeWidth="15"
          />
          <line
            x1="80%"
            y1="0%"
            x2="120%"
            y2="50%"
            stroke="rgba(99,179,237,0.06)"
            strokeWidth="25"
          />
        </svg>

        {/* Large Field Circle - center left */}
        <svg
          className="absolute"
          style={{ left: "-15%", top: "15%", width: "55%", height: "70%" }}
          viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="200"
            cy="200"
            r="190"
            fill="none"
            stroke="rgba(255,255,255,0.045)"
            strokeWidth="2.5"
          />
          <circle
            cx="200"
            cy="200"
            r="140"
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1.5"
          />
          <circle
            cx="200"
            cy="200"
            r="80"
            fill="none"
            stroke="rgba(57,107,153,0.12)"
            strokeWidth="2"
          />
          <line
            x1="200"
            y1="10"
            x2="200"
            y2="390"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1.5"
          />
          <line
            x1="10"
            y1="200"
            x2="390"
            y2="200"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1.5"
          />
          {/* Goal box lines */}
          <rect
            x="130"
            y="10"
            width="140"
            height="60"
            fill="none"
            stroke="rgba(255,255,255,0.035)"
            strokeWidth="1.5"
          />
          <rect
            x="160"
            y="10"
            width="80"
            height="30"
            fill="none"
            stroke="rgba(255,255,255,0.025)"
            strokeWidth="1.5"
          />
          <rect
            x="130"
            y="330"
            width="140"
            height="60"
            fill="none"
            stroke="rgba(255,255,255,0.035)"
            strokeWidth="1.5"
          />
          <rect
            x="160"
            y="360"
            width="80"
            height="30"
            fill="none"
            stroke="rgba(255,255,255,0.025)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Basketball / Sport Ball - top right */}
        <svg
          className="absolute"
          style={{
            right: "-8%",
            top: "-8%",
            width: "42%",
            height: "42%",
            opacity: 0.07,
          }}
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="white"
            strokeWidth="3"
          />
          {/* Horizontal seam */}
          <path
            d="M5,100 Q50,60 100,100 Q150,140 195,100"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          />
          <path
            d="M5,100 Q50,140 100,100 Q150,60 195,100"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          />
          {/* Vertical seam */}
          <path
            d="M100,5 Q60,50 100,100 Q140,150 100,195"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          />
          <path
            d="M100,5 Q140,50 100,100 Q60,150 100,195"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          />
        </svg>

        {/* Track / Running oval - bottom right */}
        <svg
          className="absolute"
          style={{
            right: "-10%",
            bottom: "-10%",
            width: "50%",
            height: "55%",
            opacity: 0.055,
          }}
          viewBox="0 0 300 220"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse
            cx="150"
            cy="110"
            rx="145"
            ry="105"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          />
          <ellipse
            cx="150"
            cy="110"
            rx="115"
            ry="78"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
          />
          <ellipse
            cx="150"
            cy="110"
            rx="85"
            ry="52"
            fill="none"
            stroke="rgba(57,107,153,0.7)"
            strokeWidth="1.5"
          />
          <ellipse
            cx="150"
            cy="110"
            rx="55"
            ry="28"
            fill="none"
            stroke="white"
            strokeWidth="1.2"
          />
          {/* Lane dashes */}
          <line
            x1="5"
            y1="110"
            x2="295"
            y2="110"
            stroke="white"
            strokeWidth="1"
            strokeDasharray="8,6"
          />
        </svg>

        {/* Trophy / Star burst - top left corner accent */}
        <svg
          className="absolute"
          style={{
            left: "2%",
            top: "3%",
            width: "12%",
            height: "12%",
            opacity: 0.1,
          }}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
            (deg, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + 45 * Math.cos((deg * Math.PI) / 180)}
                y2={50 + 45 * Math.sin((deg * Math.PI) / 180)}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={i % 2 === 0 ? "2" : "1"}
              />
            ),
          )}
          <circle
            cx="50"
            cy="50"
            r="12"
            fill="none"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="2"
          />
        </svg>

        {/* Volleyball / Sport ball - mid left */}
        <svg
          className="absolute"
          style={{
            left: "3%",
            bottom: "25%",
            width: "10%",
            height: "10%",
            opacity: 0.08,
          }}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="white"
            strokeWidth="3"
          />
          <path
            d="M50,4 Q90,30 90,70 Q70,95 50,96"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M50,4 Q10,30 10,70 Q30,95 50,96"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M4,60 Q30,40 96,60"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        </svg>

        {/* Dotted grid pattern - subtle texture */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dots"
              x="0"
              y="0"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.025)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Glowing orbs */}
        <div
          className="absolute rounded-full"
          style={{
            width: "500px",
            height: "500px",
            top: "-150px",
            right: "-150px",
            background:
              "radial-gradient(circle, rgba(57,107,153,0.25) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "400px",
            height: "400px",
            bottom: "-100px",
            left: "-100px",
            background:
              "radial-gradient(circle, rgba(57,107,153,0.2) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "300px",
            height: "300px",
            top: "40%",
            left: "40%",
            background:
              "radial-gradient(circle, rgba(99,179,237,0.07) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        {/* Bottom accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(57,107,153,0.6), rgba(99,179,237,0.8), rgba(57,107,153,0.6), transparent)",
          }}
        />

        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(57,107,153,0.4), rgba(99,179,237,0.5), rgba(57,107,153,0.4), transparent)",
          }}
        />
      </div>

      {/* ── Login Card ── */}
      <div className="relative w-full max-w-md z-10 px-4">
        <div
          className="rounded-3xl overflow-hidden border"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          {/* Top accent stripe */}
          <div
            className="h-1.5"
            style={{
              background:
                "linear-gradient(90deg, #1a3a5c, #396B99, #63b3ed, #396B99, #1a3a5c)",
            }}
          />

          {/* Header Section */}
          <div
            className="p-8 pb-4 text-center"
            style={{ background: "linear-gradient(to bottom, #f8fafc, white)" }}
          >
            <div className="flex justify-center mb-5">
              <div
                className="rounded-2xl p-4 transform transition-all duration-300 hover:scale-110 hover:rotate-3"
                style={{
                  background: "linear-gradient(135deg, #1a3a5c, #396B99)",
                  boxShadow: "0 8px 24px rgba(57,107,153,0.4)",
                }}
              >
                <img
                  src={Logo}
                  alt="FAMS Logo"
                  className="h-16 w-auto drop-shadow-lg"
                />
              </div>
            </div>

            {/* FAMS label with sporty styling */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-1"
              style={{
                background: "linear-gradient(135deg, #0f1f35, #1a3a5c)",
              }}
            >
              <svg
                className="w-3 h-3 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ color: "#fbbf24" }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <p className="text-white text-xs font-black uppercase tracking-[0.2em]">
                Filamer Athlete Management System
              </p>
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ color: "#fbbf24" }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>

          {/* Login Form */}
          <div className="px-8 py-5">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Deactivated Account Error */}
              {error && isAccountDeactivated && (
                <div className="bg-gray-50 border-2 border-gray-300 rounded-2xl overflow-hidden shadow-md">
                  <div
                    className="px-4 py-3 flex items-center gap-2.5"
                    style={{
                      background: "linear-gradient(to right, #374151, #1f2937)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.1)" }}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M13.477 14.89A6 6 0 015.11 6.524L13.477 14.89zm1.414-1.414L6.524 5.11A6 6 0 0114.89 13.477zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-white font-bold text-sm tracking-wide">
                      Account Deactivated
                    </p>
                  </div>
                  <div className="px-4 py-3.5 space-y-2">
                    <p className="text-gray-700 text-sm font-medium leading-relaxed">
                      Your account has been deactivated by your coach or
                      administrator.
                    </p>
                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
                      <svg
                        className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-blue-700 text-xs font-semibold leading-relaxed">
                        Please contact your coach for more information about
                        your account status.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Standard Error */}
              {error && !isAccountDeactivated && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="ml-3 text-red-700 text-sm font-semibold">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-xs font-black text-gray-600 uppercase tracking-widest"
                >
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400 group-focus-within:text-[#396B99] transition-all"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    autoFocus
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#396B99] focus:border-[#396B99] focus:bg-white transition-all duration-200 text-gray-700 font-medium placeholder:text-gray-400 hover:border-gray-300"
                    style={{ background: "#f8fafc" }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-black text-gray-600 uppercase tracking-widest"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400 group-focus-within:text-[#396B99] transition-all"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#396B99] focus:border-[#396B99] focus:bg-white transition-all duration-200 text-gray-700 font-medium placeholder:text-gray-400 hover:border-gray-300"
                    style={{ background: "#f8fafc" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#396B99] transition-all duration-200"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-black py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm mt-2"
                style={{
                  background: loading
                    ? "linear-gradient(135deg, #396B99, #2d5577)"
                    : "linear-gradient(135deg, #0f1f35 0%, #1a3a5c 40%, #396B99 100%)",
                  boxShadow:
                    "0 4px 20px rgba(57,107,153,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "linear-gradient(135deg, #396B99 0%, #1a3a5c 60%, #0f1f35 100%)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 8px 30px rgba(57,107,153,0.7), inset 0 1px 0 rgba(255,255,255,0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "linear-gradient(135deg, #0f1f35 0%, #1a3a5c 40%, #396B99 100%)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 4px 20px rgba(57,107,153,0.5), inset 0 1px 0 rgba(255,255,255,0.1)";
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Sign In</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 pb-6">
            <div className="pt-4 border-t border-gray-100">
              <p className="text-center text-xs text-gray-400 font-medium">
                © 2025 Filamer Christian University. All rights reserved.
              </p>
            </div>
          </div>

          {/* Bottom accent stripe */}
          <div
            className="h-1"
            style={{
              background:
                "linear-gradient(90deg, #1a3a5c, #396B99, #63b3ed, #396B99, #1a3a5c)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
