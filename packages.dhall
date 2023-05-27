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