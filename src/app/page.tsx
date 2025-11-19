import InputBox from "@/components/InputBox";

export default function page() {
    return(
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#171616]">
          <div className="w-full max-w-2xl flex flex-col items-center gap-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-center">
              Hello, How may I help you?
            </h1>
            <div className="w-full">
              <InputBox />
            </div>
          </div>
        </div>
    )
}