import {useEffect, useState} from "react";
import type {FormEvent} from "react";
import {api} from "./api";

type Algorithm = "md5" | "sha1" | "sha256" | "sha512" | "bcrypt";

interface HashEntry {
    _id: string;
    algorithm: Algorithm;
    digest: string;
    salt?: string;
    durationMs: number;
    inputLength: number;
}

const ALGORITHMS: Algorithm[] = ["md5", "sha1", "sha256", "sha512", "bcrypt"];

// MD5 and SHA-1 are vulnerable to collision attacks
const WEAK: Algorithm[] = ["md5", "sha1"];

export default function App() {
    const [text, setText] = useState("");
    const [algorithm, setAlgorithm] = useState<Algorithm>("sha256");
    const [useSalt, setUseSalt] = useState(false);
    const [entries, setEntries] = useState<HashEntry[]>([]);
    const [error, setError] = useState("");

    const load = async () => {
        const res = await api.get<HashEntry[]>("/hashes");
        setEntries(Array.isArray(res.data) ? res.data : []);
    };

    useEffect(() => {
        load().catch(() => setError("Backend not reachable"));
    }, []);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/hashes", {text, algorithm, useSalt});
            setText("");
            setError("");
            await load();
        } catch {
            setError("Could not create hash");
        }
    };

    const remove = async (id: string) => {
        await api.delete(`/hashes/${id}`);
        await load();
    };

    return (
        <main className="mx-auto max-w-2xl p-6">
            <h1 className="text-3xl font-bold text-emerald-400">Hash Lab</h1>
            <p className="mb-6 text-slate-400">Only digests are stored, never the plaintext.</p>

            <form onSubmit={submit} className="flex flex-wrap gap-2">
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Text to hash"
                    className="flex-1 rounded bg-slate-800 px-3 py-2"
                />
                <select
                    value={algorithm}
                    onChange={e => setAlgorithm(e.target.value as Algorithm)}
                    className="rounded bg-slate-800 px-2"
                >
                    {ALGORITHMS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <button className="rounded bg-emerald-500 px-4 font-semibold text-slate-950">Hash</button>
                <label className="w-full text-sm text-slate-400">
                    <input
                        type="checkbox"
                        checked={useSalt || algorithm === "bcrypt"}
                        disabled={algorithm === "bcrypt"}
                        onChange={e => setUseSalt(e.target.checked)}
                        className="mr-2"
                    />
                    Add random salt {algorithm === "bcrypt" && "(bcrypt always salts)"}
                </label>
            </form>

            {error && <p className="mt-3 text-red-400">{error}</p>}

            <ul className="mt-6 space-y-2">
                {entries.map(entry => (
                    <li key={entry._id} className="rounded bg-slate-900 p-3">
                        <div className="flex items-center justify-between text-sm">
              <span>
                {entry.algorithm} · {entry.inputLength} chars · {entry.durationMs} ms
                  {WEAK.includes(entry.algorithm) && <span className="ml-2 text-amber-400">broken</span>}
                  {(entry.salt || entry.algorithm === "bcrypt") && <span className="ml-2 text-sky-400">salted</span>}
              </span>
                            <button onClick={() => remove(entry._id)}
                                    className="text-slate-500 hover:text-red-400">delete
                            </button>
                        </div>
                        <code className="mt-1 block break-all text-xs text-emerald-300">{entry.digest}</code>
                        {entry.salt &&
                            <code className="mt-1 block break-all text-xs text-slate-500">salt: {entry.salt}</code>}
                    </li>
                ))}
            </ul>
        </main>
    );
}
