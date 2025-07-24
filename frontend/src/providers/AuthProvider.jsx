// "use client";

// import { api, ENDPOINT } from "@/lib/api";
// import { userLoggedInDetails } from "@/redux/userSlice";
// import { Loader2Icon } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";

// const AuthProvider = ({ children }) => {
//     const dispatch = useDispatch();
//     const [loading, setLoading] = useState(true);
//     useEffect(() => {
//         setLoading(true);
//         const fetcher = async () => {
//             try {
//                 const res = await api.get(ENDPOINT.user);
//                 console.log("res",res);
//                 if (res.data.status === "success") {
//                     console.log("res",res.data.user);
//                     dispatch(userLoggedInDetails(res.data.user));
//                 }
//             } catch (err) {
//                 console.log("User needs to Login", err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetcher();
//     }, [dispatch]);

//     if (loading)
//         return (
//             <div className="w-full h-screen flex items-center justify-center">
//                 <Loader2Icon className="w-[100px] h-[100px] animate-spin" />
//             </div>
//         );
//     return <>
//         {children}
//     </>
// }

// export default AuthProvider;



//second code working 

"use client";

import { api, ENDPOINT } from "@/lib/api";
import { userLoggedInDetails } from "@/redux/userSlice";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(ENDPOINT.user, {
          withCredentials: true, // ✅ ensure cookies are sent
        });

        if (res.data.status === "success" && res.data.user) {
          dispatch(userLoggedInDetails(res.data.user));
        } else {
          console.warn("No user returned or unauthorized.");
        }
      } catch (err) {
        console.error("User needs to login.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
       <Loader2Icon className="w-[100px] h-[100px] animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;



// third to try 
// "use client";

// import { createContext, useContext, useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { api, ENDPOINT } from "@/lib/api";
// import { userLoggedInDetails } from "@/redux/userSlice";
// import { Loader2Icon } from "lucide-react";

// //  Create AuthContext
// const AuthContext = createContext();

// //  Custom hook to use AuthContext
// export const useAuth = () => useContext(AuthContext);

// const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await api.get(ENDPOINT.user, {
//           withCredentials: true,
//         });

//         if (res.data.status === "success" && res.data.user) {
//           setUser(res.data.user); // local context state
//           dispatch(userLoggedInDetails(res.data.user)); //  Redux state
//         } else {
//           setUser(null);
//         }
//       } catch (err) {
//         console.error("Auth check failed:", err.message);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, [dispatch]);

//   if (loading) {
//     return (
//       <div className="w-full h-screen flex items-center justify-center">
//         <Loader2Icon className="w-[100px] h-[100px] animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <AuthContext.Provider value={{ user, setUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthProvider;
