import { useContext, useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { CardHeader } from "../ui/CardHeader";
import { Input } from "../ui/common/Input";
import { Label } from "../ui/common/Label";
import { ThemeContext } from "../App";
import { CardBody } from "../ui/common/CardBody";

export function LoginPage({ onSubmit, onSignup }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [su, setSu] = useState({
    firstName: "",
    lastName: "",
    preferredName: "",
    email: "",
  });
  const [suErr, setSuErr] = useState("");
  const [suSuccess, setSuSuccess] = useState(false);
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const doleEmail = /^[A-Za-z0-9._%+-]+@doleintl\.com$/i;

  async function handleSignIn(e) {
    e.preventDefault();
    const emailTrim = email.trim();
    const doleEmail = /^[A-Za-z0-9._%+-]+@doleintl\.com$/i;

    if (!doleEmail.test(emailTrim)) {
      setError("Use your @doleintl.com email");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const ok = await onSubmit(emailTrim);
      setSubmitting(false);

      if (!ok) {
        setError("User not found. Please sign up to create an account.");
      }
    } catch (err) {
      setSubmitting(false);
      setError("An error occurred. Please try again.");
    }
  }

  function openSu() {
    setSu({
      firstName: "",
      lastName: "",
      preferredName: "",
      email: email.trim(),
    });
    setSuErr("");
    setSuSuccess(false);
    setOpenSignup(true);
  }

  async function submitSignup(e) {
    e.preventDefault();

    if (!su.firstName || !su.lastName || !doleEmail.test(su.email.trim())) {
      setSuErr("First, Last and a valid @doleintl.com Email are required");
      return;
    }

    setSignupSubmitting(true);
    setSuErr("");

    try {
      const ok = await onSignup(su);

      if (ok === true) {
        setSuSuccess(true);
        setTimeout(() => {
          setOpenSignup(false);
          setSuSuccess(false);
        }, 3000);
      } else {
        setSuErr(
          typeof ok === "string" ? ok : "Failed to submit signup request"
        );
      }
    } catch (err) {
      setSuErr(
        "An error occurred while submitting your request. Please try again."
      );
    } finally {
      setSignupSubmitting(false);
    }
  }

  function closeSignupModal() {
    setOpenSignup(false);
    setSuSuccess(false);
    setSuErr("");
  }

  return (
    <div
      className={`min-h-screen grid md:grid-cols-2 ${
        isNight ? "theme-sunset text-white" : "theme-sunrise text-gray-900"
      }`}
      style={{
        background: isNight
          ? `radial-gradient(1000px 700px at 15% -10%, rgba(0,20,137,0.35), transparent 60%), radial-gradient(900px 600px at 90% 110%, rgba(200,16,46,0.25), transparent 55%), linear-gradient(180deg, #0b1740 0%, #030817 100%)`
          : `radial-gradient(1000px 700px at 12% -5%, rgba(57,180,232,0.10), transparent 60%), radial-gradient(900px 600px at 88% 105%, rgba(0,32,92,0.08), transparent 55%)`,
      }}
    >
      <div className="hidden md:flex items-center justify-center p-10">
        <div className="max-w-xl">
          <div className="flex items-center gap-5">
            <img
              src="/vector.png"
              alt="Vector"
              className="h-28 w-auto flex-shrink-0 drop-shadow"
            />
            <div className="text-left">
              <h1
                className={`text-4xl font-semibold tracking-tight ${
                  isNight ? "text-white" : "text-gray-900"
                }`}
              >
                Vector
              </h1>
              <p
                className={`mt-1 text-base ${
                  isNight ? "text-white/70" : "text-gray-600"
                }`}
              >
                Your Opportunity Pipeline Hub
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex items-center justify-center px-6 py-10">
        <Card className="w-full max-w-md">
          <CardHeader title="Welcome" subtitle="Use your work email" />
          <CardBody>
            <form onSubmit={handleSignIn} className="grid gap-3">
              <label className="grid gap-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="your.name@doleintl.com"
                  pattern="^[A-Za-z0-9._%+-]+@doleintl\.com$"
                  title="Use your @doleintl.com work email"
                  disabled={submitting}
                />
              </label>
              {error && (
                <div
                  className={`mt-2 text-sm ${
                    error.includes("not found")
                      ? "text-amber-600"
                      : "text-red-500"
                  }`}
                >
                  {error}
                  {error.includes("not found") && (
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={openSu}
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        Click here to sign up
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleSignIn} disabled={submitting}>
                  {submitting ? "Signing In..." : "Sign In"}
                </Button>
                <Button type="button" variant="ghost" onClick={openSu}>
                  Sign Up
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>

      {openSignup && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={closeSignupModal}
          />
          <Card
            className={`relative w-full max-w-lg ${
              isNight
                ? "bg-white/10 border-white/20"
                : "bg-white/20 border-white/40"
            }`}
          >
            <CardHeader
              title={suSuccess ? "Request Submitted!" : "Create Account"}
              subtitle={
                suSuccess
                  ? "Your request has been submitted for admin approval"
                  : "Submit for admin approval"
              }
              right={
                <Button variant="ghost" onClick={closeSignupModal}>
                  Close
                </Button>
              }
            />
            <CardBody>
              {suSuccess ? (
                <div className="text-center py-8">
                  <div
                    className={`text-6xl mb-4 ${
                      isNight ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    ✓
                  </div>
                  <p
                    className={`text-lg ${
                      isNight ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Your registration request has been submitted successfully!
                  </p>
                  <p
                    className={`text-sm mt-2 ${
                      isNight ? "text-white/70" : "text-gray-600"
                    }`}
                  >
                    An admin will review your request and you'll be notified
                    once approved.
                  </p>
                  <p
                    className={`text-xs mt-4 ${
                      isNight ? "text-white/50" : "text-gray-500"
                    }`}
                  >
                    This window will close automatically in a few seconds.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={submitSignup}
                  className="grid md:grid-cols-2 gap-4"
                >
                  <label className="grid gap-1">
                    <Label>First Name</Label>
                    <Input
                      value={su.firstName}
                      onChange={(e) =>
                        setSu({ ...su, firstName: e.target.value })
                      }
                      disabled={signupSubmitting}
                    />
                  </label>
                  <label className="grid gap-1">
                    <Label>Last Name</Label>
                    <Input
                      value={su.lastName}
                      onChange={(e) =>
                        setSu({ ...su, lastName: e.target.value })
                      }
                      disabled={signupSubmitting}
                    />
                  </label>
                  <label className="grid gap-1 md:col-span-2">
                    <Label>Preferred Name</Label>
                    <Input
                      value={su.preferredName}
                      onChange={(e) =>
                        setSu({ ...su, preferredName: e.target.value })
                      }
                      disabled={signupSubmitting}
                    />
                  </label>
                  <label className="grid gap-1 md:col-span-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={su.email}
                      onChange={(e) => setSu({ ...su, email: e.target.value })}
                      placeholder="your.name@doleintl.com"
                      pattern="^[A-Za-z0-9._%+-]+@doleintl\.com$"
                      title="Use your @doleintl.com work email"
                      disabled={signupSubmitting}
                    />
                  </label>
                  {suErr && (
                    <div
                      className={`md:col-span-2 ${
                        isNight ? "text-amber-200" : "text-amber-700"
                      } text-xs`}
                    >
                      {suErr}
                    </div>
                  )}
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={closeSignupModal}
                      disabled={signupSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={signupSubmitting}>
                      {signupSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}