import React, { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface VerificationRequestProps {
    pipelineTrace: any
    onSuccess: (result: any) => void
}

export function VerificationRequest({ pipelineTrace, onSuccess }: VerificationRequestProps) {
    const [feedback, setFeedback] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const sessionId = pipelineTrace.session_id
    const plan = pipelineTrace.analytical_plan || {}

    // Extract the "question" from the plan if available
    // The backend might return "missing_terms" list
    const missingInfo = plan.missing_terms?.join(", ") || "Specific logic"

    const isRelationshipMode = plan.status === "MISSING_RELATIONSHIP"

    // Reset feedback when the requirement changes to avoid stale text
    useEffect(() => {
        setFeedback("")
        setError(null)
    }, [missingInfo, plan.status])

    // Heuristic: Extract suggestion from explanation if possible, or just look for common columns in the UI later. 
    // Ideally backend sends this. For now let's assume the explanation contains the hint or we genericize.

    const handleConfirm = () => {
        setFeedback("Yes, link them as suggested.")
        // We trigger submit immediately
        setTimeout(() => handleSubmit("Yes, link them as suggested."), 100)
    }

    const handleSubmit = async (textOverride?: string) => {
        const textToSend = textOverride || feedback
        if (!textToSend.trim()) return

        setSubmitting(true)
        setError(null)

        try {
            const result = await api.verifyQuery(sessionId, textToSend)
            onSuccess(result)
        } catch (err: any) {
            console.error("Verification failed:", err)
            setError(err.message || "Failed to submit verification")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="bg-[#1f1e1e] border border-orange-500/30 rounded-2xl p-6 mt-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start gap-4">
                <div className="bg-orange-500/10 p-2 rounded-full shrink-0">
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                </div>

                <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-orange-100">Clarification Needed</h3>
                        <p className="text-slate-400 mt-1">
                            {isRelationshipMode
                                ? "I can see the data tables, but I don't know how they relate."
                                : <>I need to verify the logic for <span className="text-orange-400 font-mono text-sm px-1.5 py-0.5 bg-orange-500/10 rounded-md">{missingInfo}</span> before proceeding.</>
                            }
                        </p>
                    </div>

                    <div className="bg-[#171616] rounded-xl p-4 border border-[#2e2d2d]">
                        <p className="text-sm text-slate-500 mb-2 uppercase font-semibold">Discovery Question</p>
                        <p className="text-slate-300">
                            {isRelationshipMode
                                ? (plan.suggestion || "Should I auto-link these tables based on matching column names?")
                                : `How should I calculate or define "${missingInfo}"? (e.g., "Use column X", "It means A / B", etc.)`
                            }
                        </p>
                    </div>

                    {isRelationshipMode ? (
                        <div className="flex gap-3">
                            <button
                                onClick={handleConfirm}
                                disabled={submitting}
                                className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-medium px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Yes, Link Them
                            </button>
                            <button
                                onClick={() => {/* Toggle manual mode (future) */ }}
                                disabled={submitting}
                                className="flex-1 bg-[#2a2929] hover:bg-[#333] border border-[#3e3d3d] text-slate-300 font-medium px-4 py-3 rounded-xl transition-all"
                            >
                                No, let me explain
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Type your explanation here..."
                                className="w-full bg-[#2a2929] border border-[#3e3d3d] rounded-xl p-3 text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-orange-500/50 transition-colors resize-none h-24"
                            />

                            {error && (
                                <div className="text-red-400 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={() => handleSubmit()}
                                    disabled={submitting || !feedback.trim()}
                                    className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" /> Submit Clarification
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
