import InputBox from "@/components/InputBox";



export default function page() {
    return(
        <div className="flex flex-col justify-center gap-6">
          <div>
            <h1 className="text-2xl font-semibold leading-tight">
              How may I help you today?
            </h1>
          </div>
          <div className=" max-w-2xl">
            <InputBox />
          </div>
        </div>
    )
}