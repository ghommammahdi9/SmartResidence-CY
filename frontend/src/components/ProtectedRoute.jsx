import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";
import { canAccessDevices, canAccessGestion, canAccessMembers, canAccessReports, isAdmin } from "../utils/access";
import StatePanel from "./StatePanel";

const ProtectedRoute = ({ children, requireGestion = false, requireAdmin = false, requireDevices = false, requireMembers = false, requireReports = false }) => {
	const { user, checkingAuth } = useUserStore();
	const location = useLocation();

	useEffect(() => {
		if (requireAdmin && user && !isAdmin(user)) {
			toast.error("Acces reserve aux administrateurs");
		}
		if (requireGestion && user && !canAccessGestion(user)) {
			toast.error("Acces reserve au personnel residence");
		}
		if (requireDevices && user && !canAccessDevices(user)) {
			toast.error("Acces reserve au personnel residence et aux administrateurs");
		}
		if (requireMembers && user && !canAccessMembers(user)) {
			toast.error("Annuaire reserve au personnel residence et aux administrateurs");
		}
		if (requireReports && user && !canAccessReports(user)) {
			toast.error("Rapports reserves aux administrateurs");
		}
	}, [requireAdmin, requireGestion, requireDevices, requireMembers, requireReports, user]);

	if (checkingAuth) {
		return <StatePanel message='Verification de la session...' />;
	}

	if (!user) {
		return <Navigate to='/login' state={{ from: location.pathname }} replace />;
	}

	if (requireAdmin && !isAdmin(user)) {
		return <Navigate to='/dashboard' replace />;
	}

	if (requireGestion && !canAccessGestion(user)) {
		return <Navigate to='/dashboard' replace />;
	}

	if (requireDevices && !canAccessDevices(user)) {
		return <Navigate to='/dashboard' replace />;
	}

	if (requireMembers && !canAccessMembers(user)) {
		return <Navigate to='/dashboard' replace />;
	}

	if (requireReports && !canAccessReports(user)) {
		return <Navigate to='/dashboard' replace />;
	}

	return children;
};

export default ProtectedRoute;
