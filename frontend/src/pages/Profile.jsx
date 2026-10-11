
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6 text-gray-400">
        Loading profile...
      </div>
    );
  }

  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-xs text-orange-400 tracking-[0.3em]">
            ACCOUNT MANAGEMENT
          </p>

          <h1 className="text-3xl font-black mt-2">
            MY <span className="text-orange-400">PROFILE</span>
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            View your account information.
          </p>
        </div>

        <div className="bg-[#090909] border border-orange-500/20 rounded-md p-6">
          <div className="flex items-center gap-5 pb-6 border-b border-gray-900">
            <div className="w-16 h-16 flex items-center justify-center bg-orange-500/10 border border-orange-500/30 rounded-full text-3xl font-black text-orange-400">
              {user.username?.charAt(0).toUpperCase() || "U"}
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {user.username}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {user.email}
              </p>

              <p className="text-[10px] text-green-400 tracking-widest mt-2">
                ACCOUNT ACTIVE
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-[10px] text-gray-600 tracking-widest mb-2">
                USERNAME
              </p>
              <p className="text-sm text-gray-200">
                {user.username}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-gray-600 tracking-widest mb-2">
                EMAIL ADDRESS
              </p>
              <p className="text-sm text-gray-200 break-all">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-gray-600 tracking-widest mb-2">
                MEMBER SINCE
              </p>
              <p className="text-sm text-gray-200">
                {createdDate}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-gray-600 tracking-widest mb-2">
                ACCOUNT ID
              </p>
              <p className="text-xs text-gray-500 break-all">
                {user._id}
              </p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-700 tracking-widest mt-5">
          CRYPTOAI // ACCOUNT PROFILE
        </p>
      </div>
    </div>
  );
}

export default Profile;

