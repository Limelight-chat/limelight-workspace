import InputBox from "@/components/InputBox"
import { IconInfoCircle } from "@tabler/icons-react"
import { Search, ChartColumn, File } from "lucide-react"

export default function chat() {
  return (
    <div className="flex flex-col h-screen bg-[#171616] text-slate-100">

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-12 pb-32">
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
            Retrieve all rows where the incoming date is 27/10/25 and return only Lot No and Client.
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <button className="flex items-center gap-2 text-sm text-slate-300 bg-black px-2 py-1 rounded-md hover:brightness-110">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <button className="flex items-center gap-2 text-sm text-slate-300 bg-transparent px-2 py-1 rounded-md hover:brightness-110">
              <IconInfoCircle className="w-4 h-4" />
              <span>Source</span>
            </button>
            <button className="flex items-center gap-2 text-sm text-slate-300 bg-transparent px-2 py-1 rounded-md hover:brightness-110">
              <ChartColumn className="w-4 h-4" />
              <span>Charts</span>
            </button>
          </div>
          <div className="mt-4 w-full border-b border-grey-800"></div>

          <p className="text-slate-300 max-w-5xl pt-6">
            The Indian SME AI knowledge management market represents a $173 million...
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            {/* Your cards EXACTLY the same */}
            <div className="flex items-center gap-2 bg-[#232222] rounded-xl px-3 py-3 w-full sm:w-56 cursor-pointer">
              <div className="w-10 h-10 bg-orange-500 rounded-md shrink-0 flex items-center justify-center">
                <File className="w-5 h-5 text-black/80" />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase text-slate-300 font-semibold">
                  Order Management 25
                </div>
                <div className="mt-1 text-sm text-slate-400">Excel</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#232222] rounded-xl px-3 py-3 w-full sm:w-56 cursor-pointer">
              <div className="w-10 h-10 bg-orange-500 rounded-md shrink-0 flex items-center justify-center">
                <File className="w-5 h-5 text-black/80" />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase text-slate-300 font-semibold">
                  Order Management 25
                </div>
                <div className="mt-1 text-sm text-slate-400">Excel</div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-[#131313] h-56 md:h-72 rounded-2xl w-full" />
        </div>
      </div>

      {/* Fixed Input Box */}
      <div className="sticky bottom-0 w-full px-4 sm:px-6 py-4 bg-linear-to-t from-[#171616] via-[#171616] to-transparent">
        <div className="max-w-5xl mx-auto">
          <InputBox />
        </div>
      </div>

    </div>
  )
}
