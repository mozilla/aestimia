# AESTEMIA: Metal Assessment

## API Calls

Do we require authentication? How do we authenticate? Easiest would be attaching password to the request `?password=pufferfish` and using SSL.

### /submit

POST:
<pre>
    Example Call: {
      "learner": "brian@example.org",
      "criteriaUrl": "http://something.whatever.org",
      "classification": "science",
      "evidence": [
        {
          "url":"http://evidence.com/1", 
          "reflection": "This shows how great I did"
        },
        { 
          "url":"http://evidence.com/2".
          "reflection": ""
        }
      ]
      "resultsHook": "http://somesite/somewebhook",
      "rubric": {
        "minimum": 3,
        "items": [
          { "required": true, "text": "Learner is a chill bro" },
          { "required": true, "text": "Learner isn't a jerk" },
          { "required": false, "text": "Learner can funnel like 80 beers" },
          { "required": false, "text": "Learner can even lift" }
        ]
      }
    }
</pre>
 
RETURN: {submission id}
 
resultsHook: will recieve a results JSON structure on completion. (see /submission/{submission id}
 
### /submission/{submission id}
 
RETURN: JSON structure

<pre>
    {
    "submissionId": 12345,
    "evaluation": {
      "result": true,
      "items": [
        { "result": true, "text": "Learner is a chill bro", "notes": "They are chill" },
        { "result": true, "text": "Learner isn't a jerk", "notes": "Confirmed, not a jerk" },
        { "result": false, "text": "Learner can funnel like 80 beers", "notes": "not even." },
        { "result": false, "text": "Learner can even lift", "notes": "so weak" }
        ]
     }
</pre>

### What if we just use SQS?

If we use SQS, the data objects above would be the same, the difference would be the webhook would go away, and the API end points would also go away. Above would just be data structures we pop into a SQS queue.

### How do we handle evidence?

Shared S3 buckets. Then we can authenticate specifically, and only provide temporary links to the mentors. Links that expire quickly.