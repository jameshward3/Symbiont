# Monitoring standard

Capture last success, last attempt, current state, duration, processed/success/failure/retry/duplicate counts, data quality, dependency health, queue depth, rate-limit and cost usage, next run, and owner acknowledgement. States are Healthy, Degraded, Failing, Paused, Recovering, Disabled, and Unknown.

Healthy requires current positive evidence inside the approved freshness window. A late or absent heartbeat creates an incident signal. Detect execution failure, timeout, repeated retries, duplicates, partial completion, missing input, malformed output, schema drift, stale credentials, permission failure, rate or budget limits, dependency outage, data-quality failure, missing approval, unexpected external action, silence, and abnormal duration or volume.
