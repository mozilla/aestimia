# AESTIMIA

## It's [Latin for assessment](http://www.latin-dictionary.org/english-latin-online/aestimia)

Aestimia allows a mentor community to assess work based on submitted evidence and a rubric. Aestimia runs on Node.js, stores data in MongoDB, and makes use of [Amazon Simple Queue Service](http://aws.amazon.com/sqs/) for message passing.

### SQS message format

<pre>
    {
      "learner": "brian@example.org",
      "criteriaUrl": "http://something.whatever.org",
      "classification": ["science", "math],
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

### SQS Returned Message

COMING SOON
