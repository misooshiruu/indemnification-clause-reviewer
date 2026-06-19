# Sample indemnification clauses

A set of test clauses for the Indemnification Clause Reviewer. Each one exercises a
different shape of indemnity so you can see how the analyzer scores the levers and how the
redline step rebalances them.

## How to use

1. Start the app (`npm run dev`) and open http://localhost:3000.
2. In **Setup**, name Party A and Party B, mark which one is the indemnitee
   (the protected party — usually the customer/buyer), and pick the side you represent.
3. Copy one clause below — **just the text inside the code block**, not the heading —
   and paste it into the clause box.
4. Click **Review clause**. The sliders populate and risk badges appear.
5. Drag a lever toward your target and click **Revise clause** to generate redlines.

Suggested party setup is listed under each clause. Try flipping your side (indemnitee vs.
indemnitor) on the same clause — the favorable (green) end of every slider flips with you.

---

## 1. SaaS IP indemnity with a separate liability cap and carve-outs

The flagship demo (this is also the app's built-in **Load sample** clause). Adapted from
the Cooley SaaS form agreement. A one-way IP-infringement indemnity with
combination/compliance carve-outs, a separate 1× / trailing-12-month-fees liability cap, a
mutual consequential-damages waiver, and §11.3 exceptions that carve indemnification (and
other categories) out of those limits. Good for testing the cap and carve-outs levers.

**Setup:** A = *Acme Corp* (indemnitee), B = *Vendor LLC* (indemnitor).

```
10. INDEMNIFICATION.

10.1 Indemnification. SaaS Provider will defend, indemnify and hold Client and its successors, parents, subsidiaries, Affiliates, officers, directors, employees, users, and attorneys harmless from and against any and all losses, damages, costs, judgments, liabilities, and expenses (including reasonable attorneys' fees, court costs, and disbursements and costs of investigation, litigation, settlement, judgment, interest, fines and penalties) (collectively, "Losses") arising out of or relating to: (i) any Security Event, (ii) any failure by SaaS Provider to comply with Section 8 (Confidentiality and Data Security), including any Security Requirement; or (iii) any third party claims, demands, or proceedings (a "Claim") asserting that the Application Platform, Services, or the use thereof (as permitted under this Agreement) infringes or misappropriates any third party's Intellectual Property Rights.

10.2 Procedure. Client will give SaaS Provider prompt written notice of all Claims for which indemnity is sought hereunder and will provide SaaS Provider with: (a) all related documentation in Client's possession or control relating to such Claims; and (b) reasonable assistance to SaaS Provider in the defense of such Claims. SaaS Provider will control, at SaaS Provider's sole cost and expense, the defense or settlement of all such Claims and will keep Client apprised of the status of all such Claims. Client will have the right, but not the obligation, to participate in the defense of all such Claims with counsel of Client's choice at Client's sole cost and expense. If any settlement requires any action or admission by Client, then the settlement will require Client's prior written consent. Failure by Client to provide prompt notice of a claim or to provide such control, authority, information or assistance will not relieve SaaS Provider of its obligations under this section, except to the extent that SaaS Provider is materially prejudiced by such failure.

10.3 Limitations. SaaS Provider will not have any liability or indemnification obligations to Client under Section 10.1(a)(iii) of this Agreement to the extent that any Losses arise directly as a result of: (a) use of a Application Platform or Services by Client or any third party in combination with equipment, materials, products or software not authorized by SaaS Provider where the Application Platform or Services alone would not be infringing; or (b) compliance with designs, plans, or instructions provided to SaaS Provider by Client.

10.4 License, Replacement or Refund. If the Application Platform or Services becomes the subject of a Claim as set forth in Section 10.1(a)(iii) above or if SaaS Provider believes that the Application Platform or Services is likely to become the subject of a Claim, SaaS Provider may, at its sole discretion and expense: (i) use commercially reasonable efforts for a period of no less than sixty (60) days to obtain a license from such third party for the benefit of Client; (ii) replace or modify the Application Platform or Services ("Replacement") so it is no longer the subject of a Claim so long as such Replacement performs substantially the same functions as the Application Platform or Services at issue; or (iii) only if neither of the foregoing is commercially feasible, terminate this Agreement upon no less than ninety (90) days' prior written notice, during which wind-down period SaaS Provider will continue to provide the Services in accordance with this Agreement, and refund all Charges for Implementation Services and any pre-paid SaaS Charges or Professional Services Charges (as applicable).

11. LIMITATION OF LIABILITY.

11.1 EXCEPT AS OTHERWISE PROVIDED IN SECTION 11.3, IN NO EVENT WILL EITHER PARTY'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THIS AGREEMENT (INCLUDING, BUT NOT LIMITED TO, CLAIMS FOR NEGLIGENCE, STRICT LIABILITY, BREACH OF CONTRACT, MISREPRESENTATION, INFRINGEMENT OR OTHER CONTRACT OR TORT CLAIMS) EXCEED THE TOTAL CHARGES PAID BY CLIENT TO SAAS PROVIDER DURING THE MOST RECENT 12 MONTH PERIOD PRIOR TO THE LAST EVENT GIVING RISE TO LIABILITY.

11.2 EXCEPT AS OTHERWISE PROVIDED IN SECTION 11.3, IN NO EVENT WILL EITHER PARTY BE LIABLE FOR INDIRECT, SPECIAL, PUNITIVE, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF THIS AGREEMENT EVEN IF INFORMED OF THE POSSIBILITY THEREOF IN ADVANCE.

11.3 THE PARTIES EACH ACKNOWLEDGE AND AGREE THAT THE LIMITATIONS OF LIABILITY SET FORTH IN THIS SECTION 11 (LIMITATION OF LIABILITY) WILL NOT APPLY TO ANY LOSSES AS THE RESULT OF: (A) A SECURITY EVENT OR SAAS PROVIDER'S FAILURE TO COMPLY WITH SECTION 8 (CONFIDENTIALITY AND DATA SECURITY), INCLUDING ANY SECURITY REQUIREMENTS, BUT ONLY TO THE EXTENT SUCH LOSSES ARISE AS A DIRECT RESULT OF SAAS PROVIDER'S FAILURE TO ADHERE TO THE SECURITY REQUIREMENTS EXPRESSLY AGREED BY THE PARTIES; (B) INDEMNIFICATION OBLIGATIONS HEREUNDER; (C) A WILLFUL REFUSAL BY SAAS PROVIDER TO PROVIDE TERMINATION ASSISTANCE SERVICES AS REQUIRED HEREUNDER; (D) FRAUD, WILLFUL MISCONDUCT OR GROSS NEGLIGENCE; OR (E) SERVICE LEVEL CREDITS. NOTWITHSTANDING THE FOREGOING, WITH RESPECT TO ANY PROFESSIONAL SERVICES, CLIENT'S SOLE AND EXCLUSIVE REMEDY, AND SAAS PROVIDER'S ENTIRE LIABILITY, WILL BE RE-PERFORMANCE OF THE DEFICIENT PROFESSIONAL SERVICES.

11.4 Except as otherwise expressly provided herein, all rights and remedies of the Parties are separate and cumulative. The waiver or failure of either Party to exercise in any respect any right or remedy provided herein will not be deemed a waiver of any further right or remedy hereunder.
```

---

## 2. Mutual indemnity with a 2× cap

A reciprocal indemnity where both parties owe each other, capped at 2× the trailing
12-month fees. Good for testing the mutuality lever (try moving it one-way) and seeing a
higher-than-customary cap scored as broad.

**Setup:** A = *Acme* (indemnitee), B = *Globex* (indemnitor).

```
8. MUTUAL INDEMNIFICATION. Each party (the "Indemnifying Party") shall defend, indemnify and hold harmless the other party (the "Indemnified Party") and its officers, directors, and employees from and against any and all third-party claims, losses, liabilities, damages, and expenses (including reasonable attorneys' fees) arising out of or relating to the Indemnifying Party's (a) breach of this Agreement, (b) gross negligence or willful misconduct, or (c) violation of applicable law. The Indemnified Party shall promptly notify the Indemnifying Party of any claim, and the Indemnifying Party shall have sole control of the defense and settlement, provided that no settlement imposing liability on the Indemnified Party shall be entered without its prior written consent. Each party's aggregate liability under this Section shall not exceed two times (2x) the total fees paid under this Agreement in the twelve months preceding the claim.
```

---

## 3. One-way, very broad, uncapped indemnity

An aggressively pro-customer indemnity: defends and indemnifies, covers consequential and
punitive damages, both third-party and direct claims, with the broadest "arising out of,
resulting from, or in any way related to" nexus, and expressly NOT subject to any cap. Good
for testing how the indemnitor side narrows things back down (add a cap, direct damages
only, third-party claims only).

**Setup:** A = *Customer* (indemnitee), B = *Supplier* (indemnitor).

```
7. INDEMNIFICATION. Supplier shall indemnify, defend and hold harmless Customer, its affiliates, and their respective officers, directors, employees and agents from and against any and all claims, actions, suits, proceedings, losses, damages, liabilities, costs and expenses of every kind (including consequential, incidental, indirect and punitive damages, and reasonable attorneys' fees) arising out of, resulting from, or in any way related to this Agreement, the Products, or Supplier's performance or non-performance hereunder, whether based on contract, tort, strict liability, or otherwise, and regardless of whether such claims are brought by a third party or by Customer directly. This indemnity is not subject to any limitation of liability or cap set forth elsewhere in this Agreement.
```

---

## 4. Terse one-sentence indemnity (sparse text)

A bare-bones indemnity with almost nothing specified — no cap, no basket, no notice/control
terms, no duty-to-defend language. Good for testing how the analyzer scores a silent clause
and how the redline step adds missing protections from scratch.

**Setup:** A = *Buyer* (indemnitee), B = *Vendor* (indemnitor).

```
Vendor agrees to indemnify Buyer for any losses arising from Vendor's breach of this Agreement.
```

---

## 5. Non-indemnity text (negative control)

A confidentiality clause with no indemnification language at all. Use it to confirm the app
behaves gracefully on out-of-scope text: every lever should score neutral (~50) and the
revise step should produce no edits rather than fabricating any.

**Setup:** A = *Party A* (indemnitee), B = *Party B* (indemnitor).

```
5. CONFIDENTIALITY. Each party agrees to hold the other party's Confidential Information in strict confidence and not to disclose it to any third party without prior written consent. This obligation survives termination of this Agreement for a period of five (5) years.
```

---

## 6. Cap that swallows the indemnity (multiple conflicts)

A clause engineered to trip several cross-lever risk rules at once. It has a duty to defend,
but a low 1× trailing-fees cap that **expressly applies to indemnification** (no carve-out),
a strict 10-day notice that relieves the indemnitor *regardless of prejudice*, and a
non-exclusive / cumulative-remedies statement. Good for seeing several badges fire on one
clause. After **Review** (no slider moves needed — interactions score off the analyzed text),
expect roughly:

- **Cap swallows indemnity** (danger) — the cap is low and indemnity is not carved out of it.
- **Exclusive-remedy gap** (warn) — remedies are non-exclusive while a low cap/basket exists.
- **Defend + strict notice** (info) — a duty to defend paired with hair-trigger notice that
  excuses the indemnitor even absent prejudice.

**Setup:** A = *Customer* (indemnitee), B = *Provider* (indemnitor).

```
9. INDEMNIFICATION. Provider shall defend, indemnify and hold harmless Customer from and against any and all third-party claims arising out of Provider's breach of this Agreement or its negligence. Customer shall notify Provider in writing within ten (10) days of becoming aware of any such claim, and failure to provide such notice within that period shall relieve Provider of its indemnification obligations hereunder, whether or not Provider is prejudiced by the delay. Provider shall control the defense and settlement of all such claims. Notwithstanding anything to the contrary, Provider's total aggregate liability under this Agreement, including its indemnification obligations under this Section 9, shall not exceed the total fees paid by Customer to Provider in the twelve (12) months preceding the claim. The rights and remedies set forth in this Agreement are non-exclusive and cumulative, and are in addition to any other rights or remedies available at law or in equity.
```

---

## 7. Consequential damages indemnified despite a separate waiver (internal contradiction)

This clause indemnifies for consequential and punitive damages, calls indemnification the
"sole and exclusive remedy," and then a separate section waives consequential damages —
but the waiver excepts only confidentiality, **not** indemnification. The result is an
internal contradiction plus a cumulative-remedies leak. After **Review**, expect roughly:

- **Consequential-waiver conflict** (warn) — the indemnity pulls in consequential damages
  that a separate clause purports to waive, and indemnity isn't carved out of the waiver.
- **Cumulative-remedies leak** (warn) — indemnity is styled "exclusive," yet a separate
  clause makes all remedies cumulative, undercutting the exclusivity.

Try **deleting the consequential-damages waiver sentence** and re-reviewing: with the waiver
gone, the contradiction resolves but the clause now trips **No cap on consequential damages**
(danger) instead, since consequential damages are covered with no waiver to absorb them.

**Setup:** A = *Buyer* (indemnitee), B = *Supplier* (indemnitor).

```
12. INDEMNIFICATION. Supplier shall indemnify and hold harmless Buyer from and against any and all claims, losses, liabilities, damages, costs and expenses, including direct, indirect, incidental, consequential and punitive damages, arising out of or relating to Supplier's performance under this Agreement. The indemnification provided under this Section 12 shall be Buyer's sole and exclusive remedy for the matters covered hereby. 

13. WAIVER OF CONSEQUENTIAL DAMAGES. Except for breaches of Section 14 (Confidentiality), in no event shall either party be liable to the other for any indirect, incidental, special, consequential or punitive damages arising out of or relating to this Agreement, whether based in contract, tort or otherwise, even if advised of the possibility of such damages. 

15. REMEDIES. All rights and remedies provided in this Agreement are cumulative and not exclusive of any rights or remedies provided by law.
```
