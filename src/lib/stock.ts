/**
 * Placeholder stills, standing in for generated output.
 *
 * Every placeholder on this site used to be a procedural colour mosaic. That was honest
 * but useless: you cannot judge a grid, a lightbox, or a preview tile against blobs that
 * are all the same square. This pool keeps 246 entries at 39 distinct aspect ratios, so
 * every surface is still designed against the shape of the problem — but the pixels
 * themselves used to be 246 real images hotlinked live from `assets.lummi.ai`, which this
 * repo doesn't do (see `UPSTREAM.md`, resolved). `src`/`srcSet` below resolve through
 * `placeholderStill`, the same self-hosted seeded-dot generator `lib/template-videos.ts`'s
 * clips resolve through for video. No network request past this app's own origin.
 *
 * **Dimensions are baked in.** `w`/`h` were probed once at author time against the
 * original Lummi images and are kept here purely as real aspect-ratio data — the layout
 * knows every ratio before a single byte of image is requested, so it reserves exact space
 * and never shifts. They are a reference render, not the native file; only their ratio is
 * meaningful now that the pixels are locally generated.
 *
 * Source list: `dummy-responses/generated-images.txt`. Replace all of this the day the
 * Laravel generation API returns real output.
 */

import { placeholderStill } from "@/lib/placeholder-art";

/** `a` = assets.lummi.ai object, `p` = the pro image endpoint. */
type StockKind = "a" | "p";

/** [kind, identifier, reference width, reference height] — tuples to keep the payload small. */
const POOL: [StockKind, string, number, number][] = [
  ["a", "Qmdb6mU9fFduSvbZc1eE53tqC3CHVzBYQPcsTr4vQYtHCP", 256, 449],
  ["a", "QmPYTbPot8iastDfLjh8cetJkeUdNehWiSRKZGyGNSpzvV", 256, 340],
  ["a", "QmQdbnUGY6Jyzo3UYMVhbGSsNSX2nuwHYieVeowrWpPFHg", 256, 343],
  ["a", "QmWPUcdNgXpeAGWTDrpic6PbkfjudYai8a2kfrvfwhr13B", 256, 343],
  ["a", "QmNksG8JM2V7QnwktyhenxMpYmxv7y2DJRCoPgGbevvLHS", 256, 143],
  ["a", "QmdQLEnSsbNDzD9wvCNwx8eEpK1xy6RmLX8ixnj1aLd7Bm", 256, 457],
  ["a", "QmSUQKT7SFEzjwrkGQXUF9MrrMPEcVLfnN5TnnUZu2Lz4w", 256, 256],
  ["a", "QmaUEjeKwbBTcxTjDvAA6LonVAfL1R7gKDbg3Tx6bWMVmm", 256, 341],
  ["a", "QmUsUbsYQbHWpz4ihcT76KyZw8iB3ZPnB6B1RczF7T8KQD", 256, 341],
  ["a", "QmQrBUbKY3XD8gXMy2VGyBeJD7NYtSfU1CctscehatsACj", 256, 457],
  ["a", "QmefNawKLXt2eSKxaXPrqEAvbsnZSDQpofgqLc8DxxKRt3", 256, 340],
  ["a", "QmXhdJ4imgKLFEda4JxVbfpGruuEv9H2hxyNF3jUSMBzoh", 256, 341],
  ["a", "Qmc3FXMKcR9DsqS3UFG3L4ow97iwBUnWVDq1kRLCRb8FX8", 256, 469],
  ["a", "QmWb3H6aW4wRYSToErw3JaNLUoyd6MKETVMbexwh4XTgXq", 256, 412],
  ["a", "QmZK5JaYaunW8hby2CHN116zQSTKNmQseep15r6JTwPQhU", 256, 256],
  ["a", "QmXezP9Asjqf3qZzgUibFNz1ysgKeDZ5G1yDGkbYGt9feR", 256, 144],
  ["a", "QmUpTBpZFHiH53NZRXEaDcXNU1ptgoK6HGZmK9wRwDqCt1", 256, 347],
  ["a", "QmXHRWEMi3tDNxi9SVpCBMkXWjWDPHKmGnEsBizS1EzrMq", 256, 384],
  ["a", "QmTecaJ7YyhLZusuaXSzr2FJM8tQQNdiuhyoRZYVgB1XR5", 256, 192],
  ["a", "QmWT7LV1hjzty4Fm58af8HHfFVmruZ8QjDrzAvTpURd8U4", 256, 384],
  ["a", "QmSppuLpQn1dZtM45v9eU2h194zqw5kjAMYxRVePFjocN7", 256, 455],
  ["a", "QmTeweZ4yEUcWNRnoiwg1xcTumc8QUTCrXQUPgcGHFE5Cw", 256, 256],
  ["a", "QmUHw1qX6RbQy9cRBBbMrE6HsgbWvDYu5LAAUBjvyyeiH7", 256, 256],
  ["a", "QmaJab82FeK2oqNpz2AT4UjXVSpAiRSMWW9xUzm7oKEje5", 256, 256],
  ["a", "QmZ4SYRFX3Mm1uKnTZ4MUrk9SnzXqDU8G2ywKf7PqeMKS4", 256, 256],
  ["a", "QmRBwfqNUQe75D9DgPWqeDWDy7dRUQBTey4Bu3YpnJuLd1", 256, 248],
  ["a", "QmW9E7kcNrE4HEzHXDqZ2UmaVhMpxru7aScozyayqwsimT", 256, 171],
  ["a", "QmTF8rkyEMM6u7bhLeutC66FX4ASMY7syoGi9Nr1XuX4Zn", 256, 329],
  ["a", "QmP2ha5ykWf2qX6jGFkxerpiMJojcRz7j7BWDfVgNbghdG", 256, 144],
  ["a", "QmUGcH7MEro47CuvfDS3dmkW8ET7Qv5jPNdPfHmKztB35F", 256, 270],
  ["a", "QmVzynC2qPFksxCfrcKSE6tdfyHmyjF38Vd8QmksJ8iqto", 256, 340],
  ["a", "QmUtaJj4v3UPX9NPo8x8iALMmb1HTEJoG6XJpmd96CVQau", 256, 279],
  ["a", "QmXKNeK7veSGtsXToTikMB392Xw4d8kJdJywzfCqPjDdji", 256, 427],
  ["a", "QmUTftJYNnMZ7CcohXmSR6R8LxM4KiK9LfPz9btvLeW7LF", 256, 256],
  ["a", "QmXcmcJSFsFwUrYeqdSjGwBYnT7Lg8RWCpjWiUbMG2PDZd", 256, 256],
  ["a", "QmNnM8kaQzaucwZBdkGcinuqMsVcxNK2KccisCNLpaXhpC", 256, 293],
  ["a", "QmZ6kVPTjYeBQZDutuvfv5TCcM5ZKdcJCzqewEt3p9njWE", 256, 256],
  ["a", "QmdRdLYx1aEMZy92wQPTZsH5VQgTLWk4i63hH7EC9VX1cf", 256, 256],
  ["a", "QmP2QWQC3JJd34pLwLdUYbsWyLVyb1EKDbVdiugRWTvkGv", 256, 340],
  ["a", "QmZTd45rhs6fya8WJ5DSnaLPiqhUHoaWdydis2F9Kv9Puf", 256, 256],
  ["a", "QmUQMoUbpA4dRGDxZ7eqsDmL4qcgJcrb66QYsYSRhGjcfJ", 256, 320],
  ["a", "QmYPiTufdDtgiNeVyqFUWX2w7LhzXVkEaixb6bmJTTarVn", 256, 339],
  ["a", "QmTiDBQzhqgSRFCcae8qNNk7G9P1hamXhTXQYRKr2CpLpW", 256, 341],
  ["p", "5118d18b-43f6-45dd-ac51-8c58ec8b822b", 256, 256],
  ["a", "QmfNiSmCJ2ZREnwfpABJ9tQZ4LPLZEcR9noadBoXq4Tnrs", 256, 320],
  ["p", "42dd6aca-5ff2-4b9e-af9e-0e21be8898d1", 256, 384],
  ["a", "QmZ4S5f5Ar3c2TT86NNfmwABsL9AzXoUZqgSwGTRsYyXEY", 256, 341],
  ["a", "QmbfYypCUVV88qzTi3V3ftMMZtCSJRuizZCtPqVrQ4zdWq", 256, 341],
  ["a", "QmbdgarfzWVX3RN6bW2TfK8tnfCBWPeDGgmvp3y2EHV2Pe", 256, 320],
  ["a", "Qmf5mp2KqByb3jzjKgEo5biwCPk8c8dYBp9K97BFm37Q8C", 256, 143],
  ["a", "QmVArrN2TMDqjK6vqywsNmEnixz8cy8ubofxSK9oYAQNP7", 256, 128],
  ["a", "QmYcxptKd7xZzXXoSQ7whT5G5xA3ko11dCpDbzKhTK6AUt", 256, 179],
  ["a", "QmcJKcAejFSuGoAtKSjRpnCq48exxh6mVvJx9e7tZQg6dR", 256, 318],
  ["a", "QmZk3D8BCppwKnH3BwPo6qaB1iEmMa9WnLwJu7hMUZftP7", 256, 338],
  ["a", "QmUiiYv5Rmv8z2C2fetGFuWsaEnWKe18fuLcmVfCyRAeuy", 256, 340],
  ["a", "QmfHt4tX3quqNUjMTsY9vLHf7tFRxmyo47gM4RfX63qTdA", 256, 342],
  ["a", "QmWNiU5aDnAbbws7WFt1ARCRGWn1CCbLV5ARUUQSsTYtxZ", 256, 341],
  ["a", "QmRpCU8X2Tk4qA2eQVu2cnchxRD2m8xavMMwf4tUKVhsbK", 256, 341],
  ["a", "Qma48LvsEiXSqfB5fSaZfLHyKPNVN39nHqqfkc34ADfxb6", 256, 264],
  ["a", "QmcgX81wJ4j6zXgKzZT4vopRGPXHfGaDCNp7gC6GHDQDuh", 256, 341],
  ["a", "QmP3BVyRppcu5ZvkuqebnfJG8jq4j1TDhGqrCBjZjhA7gY", 256, 256],
  ["a", "QmaQJte26WDkEK3sXuhREXgsLDjy7qZqT9GSk7aT1JxZZC", 256, 341],
  ["a", "Qmev1JNCWH6LsmXZ8xBqcz41kcdqebuiMDPFGuAQMrJa8E", 256, 256],
  ["a", "QmdXR7qVcG9sYb3vePH9hd8ELJADuhA5fEUT6xZzZBBpCv", 256, 143],
  ["a", "QmWcdZLNQ6PsPcZnxhppfeWbAFvvCbYwzPeauVU6EwgREA", 256, 341],
  ["a", "QmY4vkJY19TzJYwcjU7BQkWNqs5aEm4ZKb9TC23akZn4Hh", 256, 320],
  ["a", "QmeQdjnaaADBPjqS6XRDW3w4KPuSaYPjcsCZKE3pxbhQjP", 256, 320],
  ["p", "04b39e7c-c0da-4f9e-81d0-a46c5aa049d2", 256, 384],
  ["p", "033d3f3a-79e7-4773-9c31-01897c3b59fd", 256, 556],
  ["p", "d771edf8-6961-4a57-bc05-04d400b04c46", 256, 340],
  ["a", "QmZq2k8TWfignUohniJ8MBV2DwsULVbJ64HxnCVFNxnNqV", 256, 140],
  ["a", "Qmbmjm4sEwmwKZNJeKfptkCkh9rVbzZrR2o1VmX4AgWcBR", 256, 320],
  ["a", "Qmbi9jrCKJnfZvZkfdD6AEsHsSMd9McrRuLNnQVeuq2ScY", 256, 320],
  ["a", "QmVuCNsZjCdqkLSMK8fHJvZc2MCTcVirR5C617mCwcLTZu", 256, 341],
  ["a", "Qmc9BExdcByhntjQ4XuHXWx2LkFsRhsrwZyHg1ngAq65mB", 256, 193],
  ["a", "QmZcPmWeBm8Z6dJ93Lq9u8vvtNqZFELFZEcTNFXSipqma4", 256, 143],
  ["a", "QmasZR2RUmk1KtEHVRNBgEoEkxifpt9fTRGNCwYxbQzap9", 256, 143],
  ["a", "Qmd3E1m3aqeZjCaJMttoPiVxTo2RQp4gdw4255DA5d1VWt", 256, 384],
  ["a", "QmbUfizeoJFz5p96n8vfxM9izEUE8XrWmnX6qMyvuuzAwT", 256, 143],
  ["a", "QmckLDZYHopQtxFpRztzuhUgcWCGCPFraePy74qDvKPnSv", 256, 341],
  ["p", "ba90c03f-4a1a-4469-be79-3a9f777c6d2b", 256, 337],
  ["a", "QmWbC3dj2DTpVmJT2GeAEsMCYrDk4b3jYDHKAit2VZSJQF", 256, 144],
  ["p", "017a4720-4c3d-496a-94a6-b7f52847697d", 256, 186],
  ["a", "Qmb2GzbnJU3WiSGHTBF9Ws8wqVKhU6C6N2a2SzM3cSGP2y", 256, 256],
  ["a", "QmdoDsBV3VkkGytpcYRRVPVCEgtq28XwaG1fyUEvmmh1GW", 256, 256],
  ["a", "QmNujZvpZTRQKdbhhuDx7c7xgbykS25vvVQQthqqyKVwxu", 256, 255],
  ["a", "QmcRoCkhk8DR1T5HJA5cXbN6rHnFZvS16gkxzw3rh5sP4Z", 256, 340],
  ["a", "QmQdXFVEBWxyH1yk9N3iSfVUX29BCem6kmWLUbqnrNUnXQ", 256, 193],
  ["a", "QmPx3fewhcNXPys849pCqYF66rCHgvkHqVvVPowidV1bWo", 256, 341],
  ["a", "QmchMPTQ1RBUHdBDT9NgFrvhN3fZXxEMqmBntFTRk5AbVN", 256, 320],
  ["a", "QmXH1jhNu65ybp1J9v7NEnaYffb84oMp7orzWkHxPcD8hP", 256, 320],
  ["a", "QmTJbJS9yFSuC6bJwbvjRmKUUP3vBFdHjuBiWWg59hM7Mq", 256, 339],
  ["a", "QmbuLpCmqWRk7uFdzx5ykh7YpTjWaFSHPMoktjcJKK3CFW", 256, 343],
  ["a", "QmbWcvwZsG14oQeksbjrTKftPCwLpXyFdmFXqytbz1fuFV", 256, 320],
  ["a", "Qmf3xQQjCaQ9RHVAm84gzvKcvh5itmwZuYZZZYk1D7eMfy", 256, 171],
  ["a", "Qme8Pt61yS21S1pf5uDCz6Zf8jE9YYNpTxwVn1scv85BH7", 256, 340],
  ["a", "QmeEG1sfnrALs1TSPAyAyt2wd5HNpEVhW8NkTs8hVu4jZM", 256, 384],
  ["a", "QmTLAHx6drF7x7JFY2PHRkPyPDFk3MVxaoxbCQpdRisHxA", 256, 256],
  ["a", "Qmdn88uAnoGC2QLjDAfiNtXTmpoH2gwx5CDWdMYbYPEtmF", 256, 341],
  ["a", "QmVdQm7NjqXUoG12wFGjHpzQLuRUJWiz33bqeG4U71AS3z", 256, 341],
  ["a", "QmbLUm25n6bh3doyXiXzM2dB2ADqRu8Aay5M4ajt8PZN4E", 256, 341],
  ["a", "QmVT8Pqj8Hfdy3cRYrhP8zUwGERSnQVvrbg1gJG9NHpV9x", 256, 340],
  ["a", "QmYnCXEHUikdb4V5UAmvPPFA9pc79Qij9U6ZwsYM2eeHs2", 256, 310],
  ["a", "QmSMXyHhioceib69H6JcPN3GrvUnA85KpYAkxtZcHbrMon", 256, 171],
  ["a", "QmTkBf1TPQvWHtCd5CLjdzY5NRAfdLmmUhafkhcN9uEHbf", 256, 320],
  ["a", "QmSnRozxLoFP8MRGqb1t1eXqiubTnQENxvEqTSd85jGCU7", 256, 340],
  ["a", "QmRtaJpLvPHEnAMkVPaeiVmKoZq471qoXSUT9wSvTeBsLS", 256, 256],
  ["a", "QmQFY7osobuJBwa3SjEXubD8bBqVCpEgsmqfx6jBs2L5Dv", 256, 256],
  ["a", "QmRe3SXhiTTLSwsiD1hupnTM5CFUSmCDU9VPLQemsftHe2", 256, 362],
  ["a", "Qmf9ZqYPKEgj2G2NBC7y8mJzC3x5axaVV79wN7K85TLbV6", 256, 341],
  ["a", "QmXcwxyUKXNseqHZyKCtLpqkLbviodCvXa7aFaM3wNXnk8", 256, 457],
  ["p", "04a7d7b5-f0bc-447b-9eab-5581a77cd769", 256, 256],
  ["a", "QmQthbGm42MmdLLuikb5GCh9cr1axefHifmMwEw14hVfdF", 256, 339],
  ["a", "QmaLWGWy5g5TkFWQkgBay2skhyKxF411PjMkiZ6tsSwREx", 256, 144],
  ["a", "QmPxJES5jrfC3oJ1kQCJEwEfE7GpSLcw52mohvEBLKtxk9", 256, 366],
  ["a", "Qmd7xyBoPzQZ4tmtHPryzxngVhp32Dzz3He7zW2HEx9yrn", 256, 340],
  ["p", "f8b784b9-43b6-4f78-843e-04007a49dda2", 256, 340],
  ["a", "QmTehAK6MvVQdQbQbMAptCvMLFZ1Rf2wYhxnkt72pmTUZq", 256, 455],
  ["p", "0555444d-00f1-475e-8935-61ab4fb20ad6", 256, 384],
  ["p", "0439cebe-09d3-4353-aa12-b51a45fdbac6", 256, 384],
  ["a", "QmeZpAtLvTNnGToBQzYHjJGMELiiiNLBj8Rn8aXbNvWYqM", 256, 320],
  ["a", "QmVRrJqGUTTbgF5DcqcVtPPPA6V6JZoKhkU65a1e4rSuoo", 256, 384],
  ["a", "QmWhJ6WwJLywBqRY8MB5XKPcwYASdpmXx7jzSwoC6n7Sxh", 256, 341],
  ["a", "QmXiUKTQYJYfBHH2VbXFxXbwomgAZKG3E1BFKMDwGiQF48", 256, 193],
  ["a", "QmdNwN7v8YKQDiWQDmvfgqwEcg6sWUQeS6SiNcuPDoGmMa", 256, 321],
  ["a", "QmfDrzD2wWf8V5KDVRM3dKKTURvmBDaVvQgQoGdq6WmvKz", 256, 341],
  ["p", "02b45193-cb40-4321-a92e-9c30308f499f", 256, 337],
  ["a", "QmcNhaE9AtN4fFHX2r4HDGBg2a98tw1oMYaFJhmbJp2Sh1", 256, 143],
  ["a", "QmaKiz3jFfRujCeLHEXZHEY3JmFib1EHMifgkYVh1ZHeVE", 256, 384],
  ["a", "QmTCAcbpnayhuYuaGaoZqdXmk9Lw5U6AUYYqCkCAzyDqK3", 256, 171],
  ["a", "QmdaBwPubRL5PtqriuAXgheNwf8Z1ftBLorkNchicAjdgD", 256, 143],
  ["p", "01509d42-f1a4-4b24-a43a-95df8e90e49e", 256, 169],
  ["a", "QmTy5zjRDp9u37f5jszxMdicNvpDEA2w1WKRrzb2GdjLJx", 256, 384],
  ["a", "Qmc8GXtG4oMmetSdsSzHfJCRgJDn4bWHiTozX4Mt2GSmvG", 256, 320],
  ["p", "ae35631a-6059-49ba-8332-c8a28b6cad26", 256, 143],
  ["a", "QmY8Af2AZkXDKvy4Pfa9Ntv5by1hSvQvAp2wU6TDh7kksZ", 256, 193],
  ["p", "04366e86-5367-4903-808b-238485998bfe", 256, 256],
  ["a", "QmYJswukBeARyS2CbtnVQ4bF5KfTCbJreZkf3NBfSUF4YZ", 256, 384],
  ["a", "QmU24d3yjDNpPydYkd4W6i9ps4wmyNtnLL8ZXuUGRYMBDF", 256, 193],
  ["a", "QmWp9jnV4UvRp141Z1tpb67UNnRMhnLpVWEFzq1xuCJwtf", 256, 193],
  ["a", "QmcAUFLhApbjjg4v85QwkdUCX3wPRDrojZyEW9Wfbr1qpJ", 256, 256],
  ["a", "QmcnV8Npog2DDgagsXMY7rkoibC1nuka7ANpNwrcBJHDz6", 256, 343],
  ["a", "QmV2pyfA74eoiLii72qxjbtqtGYEjgcht13VMZq3B6uKum", 256, 320],
  ["p", "79e08bbf-a416-40f7-9f48-07ace0636bc7", 256, 256],
  ["a", "QmW5jxt5Z74b64Wu1or4TktDzFX6qwWAwesLXFT2CtJXsj", 256, 340],
  ["p", "0311a815-e3cd-4869-a9a3-4ce76cdbaef4", 256, 384],
  ["a", "Qmf3gCUGfn8znTMTY4JZKS7rHvfbWaWrMCmySNfrQjvBSK", 256, 341],
  ["a", "QmY6B7PkoLtKLqJVTdXcgxm87jmUbtvdqiYuj35PGaK9D5", 256, 341],
  ["a", "QmcyGxxgwCvWV8UwkaWZzkgQxSvd561YmnATEnfVyDBWLK", 256, 341],
  ["a", "QmTaCcmkzSCKS7xXJAtwvi3KzkQkAgvpHNqazewWjMNuBm", 256, 256],
  ["a", "QmccAVeTsjgkw7xiqbThb4pns2kFyUZDpV71joRhQ6k6e8", 256, 256],
  ["a", "QmPCgtSnykGXfnsFhMVYBGrVYQVaZL3JHo6RWCeZYa2nng", 256, 256],
  ["a", "QmajnugGGuuugmVtamYNWVt7Hv2C4MZBsq3BiRRTmxQuVs", 256, 256],
  ["a", "QmPEZyCq5cwbuJNpMUXEtpTY4aXpNoTgPPdvM8HU2XyR3S", 256, 457],
  ["a", "QmfHjVzGTzeNd4vMHqvAFGXdYePW2VPDAUj4sccHGxLHEx", 256, 338],
  ["a", "QmQwH95E7UN7RCJVr73TCC9poqE4jt6kUfnK7o1JyMizR8", 256, 339],
  ["p", "a8d48c8f-38c8-4aa7-bb48-a95a8a12d601", 256, 358],
  ["a", "QmeZVWJDCiGYnBDKib2dZwc8VD7t5jVhgugTmChMSzkEWX", 256, 256],
  ["p", "3983d5db-5419-4ece-8900-22eb2fb33938", 256, 457],
  ["a", "Qmf6oCAy5GHxP6egurVXo5LQFEqWhKnMHz6iHfVAqs2LRB", 256, 320],
  ["p", "cb3df3e3-f8cf-4c19-8da8-043f440378af", 256, 171],
  ["a", "QmWvycVowongWe4HvDfLxiuc7MzUViiHrJvuJyyCefY3gw", 256, 143],
  ["a", "QmNya7M69hX42xVoSv6cncvNq9Fujr6CH67xgMyioB4pNi", 256, 384],
  ["a", "QmXvHqJHJcqDwBk2ZzpSmCc6Y3vVEoum83RrsZPgcxKPuC", 256, 341],
  ["a", "QmfNkTTBPCZJQzLm1TcS5viHnc8XWsB8p33adKXF9TxMd2", 256, 384],
  ["a", "QmPdSGBk9W59fTyszQr2jTJygMgChx6NWm1P3ZCaRfVmkw", 256, 193],
  ["a", "QmVazDirJTZkqgwp4WCKaqpvvd3xu9j47AMDVfKxy5mKPC", 256, 339],
  ["a", "QmSm4v5PBWXw6FAzDAyJgRVXm6mqaRYm8GaeeWtUaJmtQd", 256, 143],
  ["a", "QmZmHoz4Rfgv5vFgbzH86hSxc2x1RqvYhjF8iNF64KXFXZ", 256, 384],
  ["a", "QmTDJvd7pd4sY9yqNKZmrdDPp47ErWTFpGA6fEhg3Tthjg", 256, 340],
  ["p", "00a2b5c8-04d6-400e-87c1-d5deb2fd7d9f", 256, 193],
  ["a", "Qmb4HdWn5UbL5kM14ZCarLigiUWJaH49X4UQD6eGzr2EQC", 256, 256],
  ["p", "c102cd06-a865-4cb6-b368-176a72871445", 256, 256],
  ["a", "QmYLmTBxaHRWkY8X4cws3Xapmka17xBB21d1UfL2evVq8Y", 256, 256],
  ["a", "QmbyzXRpMT5BpchR577nyUm9Kjt56e9xyRMELTjsupXwBh", 256, 256],
  ["a", "Qmc22Ex5Gp5MMHfrb7RaUb3FaaPatF1ALFwCnfJJ7hT5s1", 256, 269],
  ["a", "QmQ3Pd4SDMtaMeCAAE91uMKAbvTBuiCumCvtsLWWqQAdgk", 256, 256],
  ["a", "QmfMqmZfcRbWUEwERF9iSnH2k7LuyKjwmpn1EmjqiS3vgk", 256, 320],
  ["p", "5b40fee2-cb0e-4255-a64b-1d8e0304fc12", 256, 241],
  ["a", "QmNnLBz59HosDqhuvFhkzqKksytxBPskAjtwj6GTG2TZoS", 256, 144],
  ["a", "QmQvWc9SSorcidzD4oK8NWrKiPc2TziEJMvJymmVk1fAr6", 256, 340],
  ["a", "QmP2PG9wtbKkcYt7E8gSuAab7ii9gaXjHVo1BzPR9E3QwH", 256, 384],
  ["a", "QmfJN3o5fqEqkLmuHPyJy8Spib9GHWbVDbqJb5CU7bGyt8", 256, 179],
  ["a", "QmWoroycrRfbHxMbXnxqDt3JpdmqmzhDyitS5m4LZhkaKF", 256, 342],
  ["p", "00a666ec-4ca5-435f-9187-5fdcdb73a0ba", 256, 193],
  ["a", "QmZQRwEbzWBiP9CN3xaZbnK93E7jEkxCY2JU56nS52CYXc", 256, 179],
  ["a", "QmTTFbn5tdhCF9EEPMtfz9mUxJTWpAjN7Z2hoMDh1G8BgH", 256, 340],
  ["p", "50e84c3d-8b41-437b-a918-2a4040310cd5", 256, 256],
  ["a", "QmbLkYXFmuSqCkr9L4t7S994ctuFixByxhoJqscoyqPPD1", 256, 341],
  ["p", "955f0f84-5377-44fc-8713-037f1f49a05c", 256, 340],
  ["a", "QmcY88Bok71gH6yMP3p6dmzQkgfKGNTA1tTymwURYdCeDH", 256, 143],
  ["a", "QmfQhNLGmhQQTQKXbd7d2kEn2yKP7KSoRq2J6QK7Bfotbw", 256, 341],
  ["a", "QmRayrmpsi1vDvwbZNcz5sv2tDG7dDKRpmSum3NHiJYKL8", 256, 143],
  ["a", "QmPCMFfNLDPLqAifY3m24gcFrftguVPWF6xo3ipbi1xqy7", 256, 145],
  ["a", "QmThDtGq4Gn6oNyyRUS8HirDgmjJcqtfnQJVUg41WyJC9Y", 256, 256],
  ["a", "QmWKGnRNK8y1eaVHyX1BaMULHWc91FtYLaXscwCKU6Da1j", 256, 340],
  ["p", "741f1c55-fc3f-4182-bd1e-7b26a1195372", 256, 314],
  ["p", "51a782fd-4847-4b9a-ac89-4586205742c3", 256, 316],
  ["a", "QmSkxViQ5RA5SRjRYNrD7ucyWFyDZfiKdPyCw2cAoQp63c", 256, 447],
  ["a", "QmVeXY5sKLcswEDbGijB7Mitm2LLVV7wND7ArvTmd3kNM9", 256, 256],
  ["a", "QmVN1Mmro7NAAUTzXbtXgnWEY5dcB5PSocKYdKBSrtuk4K", 256, 320],
  ["a", "QmVopUbJ7afLXaUDQekm4q1o2BYgVLqV8LUTUMxnwv9r1z", 256, 299],
  ["a", "QmNgUnZ3YSM6ho63wRtjTyMqbJJDvHy9pzgZTjSaqY2wEV", 256, 256],
  ["a", "QmaJhBXyCvroK57aDnZ9Pd6uAUMxKtd7XDBixT6f1P5Vjw", 256, 469],
  ["a", "QmeMztXJFE8g2bRhsSGvWYepmBo1DpMdpybfWDEAsCB9HT", 256, 341],
  ["a", "QmVHeCeYFEkKBt9zmj1ZgEG5uR72wYJMySvAn3QZ2pmEGp", 256, 143],
  ["a", "QmdeexPmsHQiH35uoWp7nTM1LrckPabFHnwCRfTjM8DShX", 256, 455],
  ["a", "Qmdzi7yZeQDwsGSQpsAaxFC9oGWSDt9ZqQDjXsgweEUJt6", 256, 455],
  ["a", "Qmadjstaahg5Qb4nL46YLwfUoZsXbhQybFpNBC8wVS9kap", 256, 320],
  ["a", "QmcuiF5bnsNoDcFCQsquujhJe8o4qpzyAd8UVfSNUPBi82", 256, 256],
  ["a", "QmSjYsF7VzwLGx5y5pDZbbrQPUgMjmD1DT8d4UTsiDTnxu", 256, 206],
  ["a", "QmRj7Z3B7c3CzrNC8FfV5jCs9JmznKbypqhWnqKymxxpC6", 256, 469],
  ["a", "QmdskNFucWFvQcrgVMWcoRvWmCB9ASKREHyp85b4db3MbF", 256, 128],
  ["a", "Qmd1rpG2aMe3tjeK46MRqanWdHzhnhRCkf24QsFcrbj5MJ", 256, 205],
  ["a", "QmbQriPcHLJaRTGvdc9qL2TUcatTLQsXYJoxAzzcjLAKUm", 256, 341],
  ["a", "QmQFr1mKr5U3Ah4sLKykYP97GYu31UjcsiDRsCoJUU1Yjy", 256, 340],
  ["a", "QmUJDSQN2jZo2qMAb117hnviCqLnvShB1SCrZkwZE8eLVj", 256, 320],
  ["a", "QmTgwhvLZpymKLb98Z2yz4GimEJtxWPuuB48x2mtDehGEU", 256, 256],
  ["p", "b101c0aa-bf4b-41b8-b9c0-7917d910c641", 256, 256],
  ["a", "QmPBeyZZqpeNAzU9pSHK2jEb7YxzwAGaxmW7q7uRWXdjvz", 256, 340],
  ["p", "586b4631-96d1-411b-87f6-1b411eed78af", 256, 320],
  ["a", "QmXAMf3UyKvoMGE5ry55S9KLY1C5vAXNToTh92suYxBQBb", 256, 341],
  ["a", "QmcLh33gLy2oxaqKynPtFfABrMVqvmWtbNpmivF8mkkvcv", 256, 343],
  ["a", "QmX5LB6YxzLxvXCyL2DLtoLPVwhJrv4p1ohduusss7R3DY", 256, 340],
  ["a", "Qma89bWFdSVniMNrvbxvjNdfWvSg2qvbr7avzkC4kXpKzk", 256, 256],
  ["a", "Qmea9jehfeSzcpzrQPGVP2n9Y7BJteXWwGSJDpXXMUVUPb", 256, 264],
  ["a", "QmXBALg7WCuj7d71ReCVegasLnPjKDicbf2H8BogHtmgrD", 256, 143],
  ["p", "74fb64fc-7e98-4534-a4cd-d0b222901b97", 256, 384],
  ["p", "2f30c76d-7861-421a-88cb-39de61ef3539", 256, 193],
  ["a", "QmZgbud1NbtgQWNSMomgcxtcnzHsTiKYm2GhDNZc1tdm74", 256, 310],
  ["a", "QmRF2sKD51tcYKyjy2jFNtu5ZLFwDkXCPjtS1BH5c1aKEQ", 256, 342],
  ["a", "QmSqVFdNDoBXFs21ML4o71YMzE4QufZpZi1Z6GHYeD1vCD", 256, 172],
  ["a", "QmVJrub5GA6Xc5UPfVADeaAC6fkYMRukFbD5hSvejV8bCB", 256, 340],
  ["a", "Qmb7oM5PbGF9LpD1BrrJDRLmH3BP2KrkPqt52mGaSoFAQn", 256, 256],
  ["p", "6e011c24-0522-4e1e-8f91-2219ede5719e", 256, 341],
  ["a", "QmaqzXvC7Tjb1fBFecB7Z2SEW4mAKSFnwz73BfXiWyKUGW", 256, 340],
  ["a", "QmTMciSn8AyF24SAEfmcj6hBYE41pcss1EUgbNPqYBYXer", 256, 342],
  ["a", "QmaYM8E6aCQcZFUddLSHV8sqVM9G7zLYcHseetTc4XV8ke", 256, 455],
  ["a", "QmWd8P4YU8bkBYeTCVKytBL4qDyHKXQ5oeqz7HyJ8CzSnx", 256, 193],
  ["a", "QmQy7a1rBadZ2Ai7A1j6dh5iDqWsCEWwyMzpuTCWda6k3w", 256, 143],
  ["p", "f461e13e-81e1-40e3-a2de-c08618d4787d", 256, 384],
  ["a", "QmY4bru2Yfngyu2jpu3wxg37gy4Bp6msLyc51wak6BpQdy", 256, 320],
  ["a", "Qme8qWioW53V916y8yBvVjF1Uuynnzy5CPD9e247X5GtQL", 256, 320],
  ["a", "QmavGsVid91sr2Upwr5FkrbgmUEZpTHeY98AMkyoEEHVjA", 256, 256],
  ["a", "QmV3K28DemddUAdG7m1nW38drb7e4M1rXUavg6dpGnfS3q", 256, 320],
  ["a", "QmSB5QW6TX7vUrtPoakEXrUiyEzU4dUSwDZnRXAyUU2scc", 256, 320],
];

/** Widths the ladder offers. Matched to the tile sizes this UI actually renders. */
const WIDTHS = [256, 384, 512, 768, 1024, 1536] as const;

export interface StockImage {
  id: string;
  /** Aspect ratio, width ÷ height. The layout's input. */
  aspect: number;
  /** A source at an explicit width. */
  src: (width: number) => string;
  /** The full ladder, for the browser to pick from against `sizes`. */
  srcSet: string;
}

export const STOCK: StockImage[] = POOL.map(([kind, id, w, h]) => {
  const aspect = w / h;
  // `kind`/id no longer address a remote asset — `src` ignores the requested width because
  // a data: URI has no ladder to climb, but the signature stays so every call site (which
  // passes a tile width for a real srcset) keeps working unchanged.
  const placeholder = placeholderStill(`${kind}:${id}`, aspect);
  return {
    id,
    aspect,
    src: () => placeholder,
    srcSet: WIDTHS.map((width) => `${placeholder} ${width}w`).join(", "),
  };
});

/**
 * The subset that can plausibly pass for model output.
 *
 * The full pool is a general stock library, and drawing from all of it uniformly was a
 * mistake that only became obvious on the landing page: a strip meant to show what this
 * platform produces came back with a cinnamon roll, a smartphone on a white sweep, a
 * shopping bag and two people shaking hands in an office lobby. Those are photographs of
 * *products*, and no amount of layout rescues a page that opens by advertising pastry.
 *
 * These indices were picked by eye from a contact sheet of all 246: dramatic and
 * illustrated portraits, cinematic scenes, surreal and stylised work — the kinds of
 * pictures a person actually generates. Everything shot for a catalogue is out.
 *
 * `stockFor` is *the* "this stands in for a generated image" function — every call site
 * is a result tile, a LoRA preview, a scene illustration or an avatar — so the constraint
 * belongs here rather than on one page. The cost is repetition: 50 pictures across a
 * 332-model catalogue means a face recurs. A recurring face reads as a placeholder, which
 * is what it is; a plated dessert reads as the wrong product.
 *
 * All of this goes away the day the Laravel generation API returns real output.
 */
const PORTRAITS: number[] = [
  25, 30, 32, 37, 61, 79, 84, 98, 124, 141, 148, 149, 167, 173, 174, 175, 176, 196, 198,
  199, 201, 224, 225, 235, 241, 242, 244,
];

const SCENES: number[] = [
  65, 66, 118, 123, 132, 136, 150, 158, 159, 160, 161, 168, 186, 187, 189, 190,
  193, 230, 243,
];

const ART: number[] = [...PORTRAITS, ...SCENES];

/**
 * What a placeholder is standing in for.
 *
 * Restricting the pool to art-looking pictures fixed the worst of it but not all of it: a
 * *character* LoRA called "Wren Halloway" was still resolving to a photograph of a
 * bedroom, and then the chat demo put that bedroom in the avatar slot next to her name.
 * A character needs a face. A scene illustration needs somewhere to be. Callers that know
 * which they are asking for say so, and the ones that don't care get the whole set.
 */
export type StockSubject = "portrait" | "scene";

function poolFor(subject?: StockSubject): number[] {
  if (subject === "portrait") return PORTRAITS;
  if (subject === "scene") return SCENES;
  return ART;
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * The same seed always yields the same image — the property the mosaic placeholders had
 * and the reason a reel or a result grid stays recognisable across reloads.
 *
 * The same seed under a *different* subject is a different picture, deliberately: that is
 * how one LoRA can have a face in the catalogue and a landscape in a story illustration
 * without either one being random.
 */
export function stockFor(seedKey: string | number, subject?: StockSubject): StockImage {
  const pool = poolFor(subject);
  return STOCK[pool[hash(String(seedKey)) % pool.length]];
}

/**
 * A stable, non-repeating run — for a grid that wants N distinct images.
 *
 * `stockFor` per tile is wrong for a small grid: it hashes each key independently, so two
 * of eight options can collide, and two identical pictures side by side in a picker read
 * as a rendering bug rather than as placeholders. Striding one pool with a step coprime to
 * its length guarantees distinctness for any run shorter than the pool.
 *
 * Wraps once it runs out rather than falling back to the full pool: a grid that started
 * with generated-looking work and finished with office stock would be worse than one that
 * repeats.
 */
export function stockRun(
  seedKey: string | number,
  count: number,
  subject?: StockSubject
): StockImage[] {
  const pool = poolFor(subject);
  const start = hash(String(seedKey)) % pool.length;
  return Array.from(
    { length: count },
    (_, i) => STOCK[pool[(start + i * 7) % pool.length]]
  );
}
