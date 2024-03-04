import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
	return (
		<main className="grid place-items-center h-screen">
			<SignIn />
		</main>
	);
};

export default SignInPage;
