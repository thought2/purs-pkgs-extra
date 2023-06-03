gen-pkgs:
    tsc
    node dist/gen.js > packages.dhall

commit:
    git add repos.json packages.dhall
    git commit -m "Change packages"