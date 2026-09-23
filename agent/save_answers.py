"""
save_answers.py
---------------
Runs all 20 benchmark cases and saves submission-ready answer JSON files to results/answers/.
"""

import csv
import json
import os
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path("C:/HHGoa")))

from agent.answer_generator import generate_answer_file
from agent.graph import run_case

CASE_PACK_PATH = Path("C:/HHGoa/data/case_pack.csv")
ANSWERS_DIR = Path("C:/HHGoa/results/answers")
ANSWERS_DIR.mkdir(parents=True, exist_ok=True)


def main():
    if not CASE_PACK_PATH.exists():
        print(f"Error: case pack file not found at {CASE_PACK_PATH}")
        sys.exit(1)

    with open(CASE_PACK_PATH, mode="r", encoding="utf-8-sig") as f:
        cases = list(csv.DictReader(f))

    print(f"Loaded {len(cases)} benchmark cases from {CASE_PACK_PATH}")
    print(f"Saving answer files to: {ANSWERS_DIR}\n")

    summary = []
    total_start = time.time()

    for idx, case_row in enumerate(cases, 1):
        case_id = case_row.get("case_id", f"CASE-{idx}")
        trigger = case_row.get("trigger_type", "unknown")
        print(f"[{idx}/{len(cases)}] Running {case_id} ({trigger})...", end=" ", flush=True)

        start_t = time.time()
        try:
            state = run_case(case_row)
            answer_data = generate_answer_file(state)

            output_file = ANSWERS_DIR / f"{case_id}.json"
            with open(output_file, mode="w", encoding="utf-8") as out_f:
                json.dump(answer_data, out_f, indent=2, ensure_ascii=False)

            status = answer_data.get("case", {}).get("status", "unknown")
            verdict = answer_data.get("case", {}).get("verdict", "unknown")
            sar_file = answer_data.get("sar", {}).get("file", False)
            elapsed = round(time.time() - start_t, 2)

            print(f"status={status}, verdict={verdict}, sar={sar_file} ({elapsed}s)")
            summary.append({
                "case_id": case_id,
                "status": status,
                "verdict": verdict,
                "sar_filed": sar_file,
                "elapsed_s": elapsed,
            })
        except Exception as err:
            print(f"ERROR: {err}")
            summary.append({
                "case_id": case_id,
                "error": str(err),
            })

    total_elapsed = round(time.time() - total_start, 2)
    summary_file = ANSWERS_DIR / "_answers_summary.json"
    with open(summary_file, mode="w", encoding="utf-8") as sf:
        json.dump(summary, sf, indent=2, ensure_ascii=False)

    print(f"\n=== Completed {len(cases)} cases in {total_elapsed}s ===")
    print(f"Summary written to: {summary_file}")


if __name__ == "__main__":
    main()
