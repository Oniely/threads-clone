import AccountProfile from "@/components/forms/AccountProfile";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Onboarding = async () => {
	const user = await currentUser();

	// will come from db
	const userInfo = await fetchUser(user?.id!);

  if (userInfo.onboarded) {
    redirect('/');
  }

	const userData = {
		id: user?.id,
		objectId: userInfo?._id,
		username: userInfo?.username || user?.username,
		name: userInfo?.name || user?.firstName || "",
		bio: userInfo?.bio || "",
		image: userInfo?.image || user?.imageUrl
	}

	return (
		<main className="mx-auto flex flex-col max-w-3xl px-10 py-20">
			<h1 className="head-text">Onboarding</h1>
			<p className="mt-3 text-base-regular text-light-2">
				Complete you profile now to use Threads
			</p>

			<section className="mt-9 bg-dark-2 p-10">
				<AccountProfile user={userData} btnTitle="Continue" />
			</section>
		</main>
	);
};

export default Onboarding;
