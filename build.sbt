
val logbackVersion = "1.1.7"
val jettyVersion = "9.3.8.v20160314"
val jerseyVersion = "2.22.2"
val jacksonVersion = "2.7.3"

lazy val pivotTable = (project in file("."))
  .settings(
    name := "pivot-table",
    scalaVersion := "2.11.7",
    libraryDependencies ++= Seq(
      "org.eclipse.jetty" % "jetty-server" % jettyVersion,
      "org.eclipse.jetty" % "jetty-servlet" % jettyVersion,
      "org.slf4j" % "slf4j-api" % "1.7.13",
      "ch.qos.logback" % "logback-core" % logbackVersion,
      "ch.qos.logback" % "logback-classic" % logbackVersion,
      "org.glassfish.jersey.core" % "jersey-common" % jerseyVersion,
      "org.glassfish.jersey.core" % "jersey-server" % jerseyVersion,
      "org.glassfish.jersey.containers" % "jersey-container-servlet" % jerseyVersion,
      "org.glassfish.jersey.media" % "jersey-media-json-jackson" % jerseyVersion,
      "com.fasterxml.jackson.core" % "jackson-core" % jacksonVersion,
      "com.fasterxml.jackson.core" % "jackson-databind" % jacksonVersion,
      "com.fasterxml.jackson.module" % "jackson-module-scala_2.11" % jacksonVersion,
      "com.fasterxml.jackson.datatype" % "jackson-datatype-jsr310" % jacksonVersion)
  )
