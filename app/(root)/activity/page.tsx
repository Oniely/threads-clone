import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import Link from "next/link";
import Image from "next/image";
  

const Activity = async () => {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const activity = await getActivity(userInfo._id);
    
  console.log(activity);

  return (
    <>
      <h1 className="head-text mb-10">Activity</h1>

      <section className="mt-10 flex flex-col gap-5">
          { activity?.length! > 0
            ? (
              <>
                { activity?.map((activity: any) => (
                    <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                      <article className="activity-card">
                        <Image 
                          src={activity.author.image}
                          alt="Profile Photo"
                          width={20}
                          height={20}
                          className="rounded-full object-cover"
                        />
                        <p className="space-x-1 !text-small-regular text-light-1">
                          <span className="text-primary-500">{activity.author.name}</span>
                          <span>replied to your thread</span>
                        </p>
                      </article>
                    </Link>
                )) }
              </>
              )
            : ( <p>No activity yet</p> )
          }
      </section>
    </>
  );
};

export default Activity