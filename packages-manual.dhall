let upstream =
      https://github.com/purescript/package-sets/releases/download/psc-0.15.8-20230430/packages.dhall
        sha256:007f16aff737b37041e2f387f906ea711c85afc19b898e9f4986ec85cb96efc4

in  upstream

  with virtual-dom =
      { dependencies =
          [ "either"
          , "foreign"
          , "maybe"
          , "prelude"
          , "strings"
          , "transformers"
          , "tuples"
          , "variant"
          ]
      , repo =
          "https://github.com/thought2/purescript-virtual-dom.git"
      , version =
          "main"
      }

  with virtual-dom-react-basic =
      { dependencies =
          [ "console"
          , "effect"
          , "foreign"
          , "foreign-object"
          , "maybe"
          , "prelude"
          , "react-basic"
          , "react-basic-dom"
          , "strings"
          , "tuples"
          , "unsafe-coerce"
          , "virtual-dom"
          ]
      , repo =
          "https://github.com/thought2/purescript-virtual-dom-react-basic.git"
      , version =
          "main"
      }

  with data-mvc =
      { dependencies =
          [ "heterogeneous"
          , "maybe"
          , "newtype"
          , "prelude"
          , "record"
          , "variant"
          ]
      , repo =
          "https://github.com/thought2/purescript-data-mvc.git"
      , version =
          "main"
      }

  with virtual-dom-halogen =
      { dependencies =
          [ "aff"
          , "arrays"
          , "bifunctors"
          , "effect"
          , "foreign"
          , "halogen"
          , "prelude"
          , "safe-coerce"
          , "strings"
          , "tuples"
          , "unsafe-coerce"
          , "virtual-dom"
          , "web-events"
          , "web-html"
          ]
      , repo =
          "https://github.com/thought2/purescript-virtual-dom-halogen.git"
      , version =
          "main"
      }

  with marked =
      { dependencies =
          [ "console"
          , "dts"
          , "effect"
          , "either"
          , "maybe"
          , "newtype"
          , "nullable"
          , "prelude"
          , "unsafe-coerce"
          , "untagged-union"
          , "variant"
          , "variant-encodings"
          , "ts-bridge"
          ]
      , repo =
          "ssh://git@github.com/thought2/purescript-marked.git"
      , version =
          "main"
      }

  with variant-encodings =
      { dependencies =
          [ "prelude", "unsafe-coerce", "variant" ]
      , repo =
          "https://github.com/thought2/purescript-variant-encodings.git"
      , version =
          "main"
      }

  with ts-bridge =
      { dependencies =
          [ "aff"
          , "aff-promise"
          , "arrays"
          , "console"
          , "dts"
          , "effect"
          , "either"
          , "foldable-traversable"
          , "maybe"
          , "newtype"
          , "node-buffer"
          , "node-fs"
          , "node-fs-aff"
          , "node-path"
          , "node-process"
          , "nullable"
          , "optparse"
          , "ordered-collections"
          , "ordered-set"
          , "prelude"
          , "record"
          , "safe-coerce"
          , "strings"
          , "transformers"
          , "tuples"
          , "untagged-union"
          , "variant"
          , "variant-encodings"
          ]
      , repo =
          "https://github.com/thought2/purescript-ts-bridge.git"
      , version =
          "literals"
      }

  with markdown-to-virtual-dom =
      { dependencies =
          [ "console", "effect", "either", "marked", "maybe", "prelude", "virtual-dom" ]
      , repo =
          "ssh://git@github.com/thought2/purescript-markdown-to-virtual-dom.git"
      , version =
          "main"
      }


