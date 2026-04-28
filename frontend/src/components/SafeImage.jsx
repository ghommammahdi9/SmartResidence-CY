import { useEffect, useState } from "react";
import fallbackResidence from "../assets/photos/residence/residence-exterior.jpg";

const SafeImage = ({
	src,
	alt,
	className = "",
	fallbackSrc = fallbackResidence,
	fallbackLabel = "Visuel SmartResidence CY",
	...rest
}) => {
	const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		setCurrentSrc(src || fallbackSrc);
		setFailed(false);
	}, [src, fallbackSrc]);

	const handleError = () => {
		if (currentSrc !== fallbackSrc) {
			setCurrentSrc(fallbackSrc);
			return;
		}
		setFailed(true);
	};

	if (failed) {
		return (
			<div className={`flex items-center justify-center bg-slate-900/60 p-6 text-center text-sm text-slate-300 ${className}`}>
				<div>
					<p className='font-semibold text-white'>{fallbackLabel}</p>
					<p className='mt-2'>Image temporairement indisponible</p>
				</div>
			</div>
		);
	}

	return <img {...rest} src={currentSrc} alt={alt} className={className} onError={handleError} />;
};

export default SafeImage;
