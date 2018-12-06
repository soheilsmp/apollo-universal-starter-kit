import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer
import app.GlobalModule
import ch.megard.akka.http.cors.scaladsl.CorsDirectives.cors
import ch.megard.akka.http.cors.scaladsl.settings.CorsSettings
import core.AppInitialization
import core.graphql.schema.GraphQL
import core.routes.frontend.FrontendRoute
import core.routes.graphql.{GraphQLRoute, HttpHandler, WebSocketHandler}
import guice.Injector._
import modules.session.JWTSessionImpl
import monix.execution.Scheduler

import scala.concurrent.ExecutionContext

object Main extends App with AppInitialization {
  implicit val system: ActorSystem = inject[ActorSystem]
  implicit val materializer: ActorMaterializer = inject[ActorMaterializer]
  implicit val executionContext: ExecutionContext = inject[ExecutionContext]
  implicit val scheduler: Scheduler = inject[Scheduler]

  val globalModule = inject[GlobalModule].fold
  val graphQL = new GraphQL(globalModule)

  val graphQLRoute = new GraphQLRoute(
    httpHandler = new HttpHandler(graphQL),
    inject[JWTSessionImpl],
    webSocketHandler = new WebSocketHandler(graphQL),
    graphQL
  )

  val routes = List(graphQLRoute, inject[FrontendRoute])
  val corsSettings = CorsSettings.apply(system)

  withActionsBefore {
    globalModule.slickSchemas.map(_.create()).toSeq
  }(
    Http().bindAndHandle(
      cors(corsSettings)(routes.map(_.routes).reduce(_ ~ _)),
      interface = "0.0.0.0"
    )
  )
}