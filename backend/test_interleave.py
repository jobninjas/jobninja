import time

def _interleave_jobs_by_company(jobs, max_contiguous=1):
    WAVE_SIZE = 20
    if not jobs:
        return []

    buckets = {}
    companies_in_order = []
    for job in jobs:
        company = (job.get("company") or "Unknown").strip()
        if company not in buckets:
            buckets[company] = []
            companies_in_order.append(company)
        buckets[company].append(job)

    wave_companies = companies_in_order[:WAVE_SIZE]

    result = []
    t0 = time.time()
    while any(buckets[c] for c in wave_companies):
        if time.time() - t0 > 2:
            print("Infinite loop detected!")
            break
        for company in wave_companies:
            if buckets[company]:
                result.append(buckets[company].pop(0))
    print("Done interleaving")
    return result

jobs = [{"company": "A"} for _ in range(500000)]
_interleave_jobs_by_company(jobs)
