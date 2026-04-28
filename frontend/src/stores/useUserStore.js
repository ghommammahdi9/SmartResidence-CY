import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set) => ({
	user: null,
	loading: false,
	checkingAuth: true,
	lastVerification: null,
	lastVerificationDelivery: null,
	lastVerificationMessage: "",
	lastVerificationRetryAfter: 0,

	signup: async (payload) => {
		set({ loading: true });

		if (payload.password !== payload.confirmPassword) {
			set({ loading: false });
			toast.error("Les mots de passe ne correspondent pas.");
			return null;
		}

		try {
			const res = await axios.post("/auth/signup", payload);
			set({
				loading: false,
				lastVerification: res.data.demoVerification || null,
				lastVerificationDelivery: res.data.verificationDelivery || null,
				lastVerificationMessage: res.data.verificationDeliveryMessage || res.data.message || "",
				lastVerificationRetryAfter: 0,
			});
			toast.success("Registration submitted! Check your email for verification code.");
			return res.data;
		} catch (error) {
			set({ loading: false });
			set({ lastVerificationRetryAfter: error.response?.data?.retryAfter || 0 });
			toast.error(error.response?.data?.message || "Une erreur est survenue.");
			return null;
		}
	},

	verifyEmailCode: async ({ email, code }) => {
		set({ loading: true });
		try {
			const res = await axios.post("/auth/verify-email-code", { email, code });
			set({ loading: false });
			toast.success(res.data.message || "Email verifie avec succes.");
			return res.data;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Verification impossible.");
			return null;
		}
	},

	resendVerificationCode: async (email) => {
		set({ loading: true });
		try {
			const res = await axios.post("/auth/resend-verification-code", { email });
			set({
				loading: false,
				lastVerification: res.data.demoVerification || null,
				lastVerificationDelivery: res.data.verificationDelivery || null,
				lastVerificationMessage: res.data.verificationDeliveryMessage || res.data.message || "",
				lastVerificationRetryAfter: 0,
			});
			toast.success(res.data.message || "Nouveau code genere.");
			return res.data;
		} catch (error) {
			set({ loading: false, lastVerificationRetryAfter: error.response?.data?.retryAfter || 0 });
			toast.error(error.response?.data?.message || "Renvoi impossible.");
			return null;
		}
	},

	login: async (email, password) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password }, { _skipAuthRefresh: true });
			set({ user: res.data.user || null });
			toast.success("Connexion reussie.");
			return { success: true, user: res.data.user };
		} catch (error) {
			const payload = error.response?.data || {};
			if (!payload.needsVerification) {
				toast.error(payload.message || "Email ou mot de passe invalide.");
			}
			return {
				success: false,
				needsVerification: Boolean(payload.needsVerification),
				email: payload.email || email,
				message: payload.message || "Email ou mot de passe invalide.",
			};
		} finally {
			set({ loading: false, checkingAuth: false });
		}
	},

	logout: async () => {
		try {
			await axios.post("/auth/logout", null, { _skipAuthRefresh: true });
		} catch (error) {
			toast.error(error.response?.data?.message || "Une erreur est survenue pendant la deconnexion.");
		} finally {
			set({ user: null, loading: false, checkingAuth: false });
		}
	},

	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/auth/profile", { _skipAuthRefresh: true });
			set({ user: response.data.user || null });
		} catch (error) {
			if (error.response?.status !== 401) {
				console.error("Auth check failed", error);
			}
			set({ user: null });
		} finally {
			set({ checkingAuth: false, loading: false });
		}
	},

	refreshToken: async () => {
		try {
			const response = await axios.post("/auth/refresh-token", null, { _skipAuthRefresh: true });
			return response.data;
		} catch (error) {
			set({ user: null, loading: false, checkingAuth: false });
			throw error;
		}
	},
}));

let refreshPromise = null;

const AUTH_ENDPOINTS = ["/auth/login", "/auth/logout", "/auth/profile", "/auth/refresh-token"];

const isAuthEndpoint = (url = "") => AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (
			error.response?.status === 401 &&
			originalRequest &&
			!originalRequest._retry &&
			!originalRequest._skipAuthRefresh &&
			!isAuthEndpoint(originalRequest.url)
		) {
			originalRequest._retry = true;

			try {
				if (!refreshPromise) {
					refreshPromise = useUserStore.getState().refreshToken();
				}

				await refreshPromise;
				return axios(originalRequest);
			} catch (refreshError) {
				useUserStore.setState({ user: null, loading: false, checkingAuth: false });
				return Promise.reject(refreshError);
			} finally {
				refreshPromise = null;
			}
		}
		return Promise.reject(error);
	}
);
