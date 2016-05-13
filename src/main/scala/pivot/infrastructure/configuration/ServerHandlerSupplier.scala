package pivot.infrastructure.configuration

import javax.ws.rs.ext.{ContextResolver, Provider}

import com.fasterxml.jackson.databind.ObjectMapper
import org.eclipse.jetty.server.Handler
import org.eclipse.jetty.servlet.{DefaultServlet, ServletContextHandler, ServletHolder}
import org.eclipse.jetty.util.resource.Resource
import org.glassfish.jersey.jackson.JacksonFeature
import org.glassfish.jersey.server.ResourceConfig
import org.glassfish.jersey.servlet.ServletContainer
import pivot.infrastructure.json.Json
import pivot.service.DataService

object ServerHandlerSupplier extends ConfiguredSupplier[Handler] {
  override def configure(source: ConfigurationSource): Handler = {
    val handler = new ServletContextHandler()
    addStaticContent("/*", handler, source)
    addRestLayer("/rest/*", handler, source)

    handler
  }

  private def addStaticContent(path: String, handler: ServletContextHandler, source: ConfigurationSource): Unit = {
    val staticContentServletHolder = new ServletHolder(classOf[DefaultServlet])
    handler.addServlet(staticContentServletHolder, path)
    handler.setInitParameter("cacheControl", "no-cache,no-store,must-revalidate")

    if (source.get("devMode", defaultValue = false)) {
      handler.setBaseResource(Resource.newResource("./src/main/resources/webroot"))
    } else {
      handler.setBaseResource(Resource.newClassPathResource("webroot/"))
    }
  }

  private def addRestLayer(path: String, handler: ServletContextHandler, source: ConfigurationSource): Unit = {
    val resourceConfig = new ResourceConfig
    resourceConfig.register(classOf[JsonProvider])
    resourceConfig.register(classOf[JacksonFeature])

    resourceConfig.register(new DataService, 0)

    handler.addServlet(new ServletHolder(new ServletContainer(resourceConfig)), path)
  }
}

@Provider
class JsonProvider extends ContextResolver[ObjectMapper] {
  override def getContext(aClass: Class[_]): ObjectMapper = Json.objectMapper
}
