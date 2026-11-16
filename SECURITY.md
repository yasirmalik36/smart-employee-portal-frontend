# Security Policy

## Supported versions

This is a portfolio / reference project. Security fixes are applied to the `main` branch only.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report privately through GitHub's **[Report a vulnerability](../../security/advisories/new)** button (Security tab → Advisories), or email **yash36114@gmail.com** with:

- a description of the issue and its impact
- steps to reproduce or a proof of concept
- any suggested fix

You can expect an acknowledgement within a few days. Please give reasonable time for a fix before any public disclosure.

## Secrets

This repository should never contain real credentials. Configuration values are supplied through environment variables or local secret stores — see the README for the variables each component expects.
