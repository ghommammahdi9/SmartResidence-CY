import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage";
import FreeTourPage from "./pages/FreeTourPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import PublicSearchPage from "./pages/PublicSearchPage";
import SignUpPage from "./pages/SignUpPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import MembersPage from "./pages/MembersPage";
import MemberDetailsPage from "./pages/MemberDetailsPage";
import DevicesPage from "./pages/DevicesPage";
import DeviceDetailsPage from "./pages/DeviceDetailsPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailsPage from "./pages/ServiceDetailsPage";
import MyResidencePage from "./pages/MyResidencePage";
import ReportIssuePage from "./pages/ReportIssuePage";
import ReservationsPage from "./pages/ReservationsPage";
import GestionDashboardPage from "./pages/GestionDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import LogsPage from "./pages/LogsPage";
import ReportsPage from "./pages/ReportsPage";
import NotFoundPage from "./pages/NotFoundPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import { useUserStore } from "./stores/useUserStore";

function App() {
	const { user, checkAuth, checkingAuth } = useUserStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (checkingAuth) return <LoadingSpinner />;

	return (
		<div className='app-shell min-h-screen text-white'>
			<Navbar />
			<main className='app-main relative z-10 pb-12'>
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/tour' element={<FreeTourPage />} />
					<Route path='/announcements' element={<AnnouncementsPage />} />
					<Route path='/public-search' element={<PublicSearchPage />} />
					<Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
					<Route path='/verify-email' element={<VerifyEmailPage />} />
					<Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/dashboard' />} />
					<Route path='/dashboard' element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
					<Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
					<Route path='/members' element={<ProtectedRoute requireMembers><MembersPage /></ProtectedRoute>} />
					<Route path='/members/:id' element={<ProtectedRoute requireMembers><MemberDetailsPage /></ProtectedRoute>} />
					<Route path='/devices' element={<ProtectedRoute requireDevices><DevicesPage /></ProtectedRoute>} />
					<Route path='/devices/:id' element={<ProtectedRoute requireDevices><DeviceDetailsPage /></ProtectedRoute>} />
					<Route path='/services' element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
					<Route path='/services/:id' element={<ProtectedRoute><ServiceDetailsPage /></ProtectedRoute>} />
					<Route path='/my-residence' element={<ProtectedRoute><MyResidencePage /></ProtectedRoute>} />
					<Route path='/report-issue' element={<ProtectedRoute><ReportIssuePage /></ProtectedRoute>} />
					<Route path='/reservations' element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />
					<Route path='/gestion' element={<ProtectedRoute requireGestion><GestionDashboardPage /></ProtectedRoute>} />
					<Route path='/administration' element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>} />
					<Route path='/logs' element={<ProtectedRoute requireAdmin><LogsPage /></ProtectedRoute>} />
					<Route path='/reports' element={<ProtectedRoute requireReports><ReportsPage /></ProtectedRoute>} />
					<Route path='*' element={<NotFoundPage />} />
				</Routes>
			</main>
			<Footer />
			<Toaster
				position='top-right'
				toastOptions={{
					duration: 4000,
					style: {
						background: "rgba(9, 20, 33, 0.96)",
						color: "#e8f0ff",
						border: "1px solid rgba(164, 198, 255, 0.14)",
					},
					success: {
						iconTheme: {
							primary: "#5dd39e",
							secondary: "#08121d",
						},
					},
					error: {
						iconTheme: {
							primary: "#fb7185",
							secondary: "#fff1f2",
						},
					},
				}}
			/>
		</div>
	);
}

export default App;
