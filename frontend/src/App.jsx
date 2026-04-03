import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home        from "./pages/Home";
import Auth        from "./pages/Auth";
import Upload      from "./pages/Upload";
import Navbar      from "./components/Navbar";
import Dashboard   from "./pages/Dashboard";
import Profile     from "./pages/Profile";
import VideoPlayer from "./pages/VideoPlayer";
import Channel     from "./pages/Channel";

const AUTH_ROUTES = ["/login", "/register"];

function Layout() {
  const { pathname } = useLocation();
  const isAuth = AUTH_ROUTES.includes(pathname);
  return (
    <>
      {!isAuth && <Navbar />}
      <Routes>
        <Route path="/"                   element={<Home />}        />
        <Route path="/login"              element={<Auth />}        />
        <Route path="/register"           element={<Auth />}        />
        <Route path="/upload"             element={<Upload />}      />
        <Route path="/video/:id"          element={<VideoPlayer />} />
        <Route path="/dashboard"          element={<Dashboard />}   />
        <Route path="/profile"            element={<Profile />}     />
        <Route path="/channel/:username"  element={<Channel />}     />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
